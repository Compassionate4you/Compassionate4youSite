const fs = require('node:fs');
const path = require('node:path');

const LOCALES_DIR = path.resolve(__dirname, '../client/src/locales');
const REPORT_PATH = path.resolve(__dirname, 'translation-report.json');
const CANONICAL_LOCALE = 'en';
const DEFAULT_LOCALES = ['es', 'pa', 'ur'];

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};

const SHOULD_TRANSLATE = flag('translate-missing');
const OVERWRITE_EXISTING = flag('overwrite');
const DRY_RUN = flag('dry-run');
const CHECK_ONLY = flag('check');
const MARK_UNTRANSLATED = flag('mark-untranslated');
const LIST_LANGUAGES = flag('list-languages');
const ALL_SUPPORTED = flag('all-supported');
const TRANSLATE_URL = (process.env.LIBRETRANSLATE_URL || '').replace(/\/$/, '');
const API_KEY = process.env.LIBRETRANSLATE_API_KEY;
const DELAY_MS = Number(process.env.LIBRETRANSLATE_DELAY_MS || 0);
const CODE_MAP = (() => {
  try { return JSON.parse(process.env.LIBRETRANSLATE_CODE_MAP || '{}'); } catch { return {}; }
})();

// Keys that must never be machine translated. The chatbot highlight phrases have to match the page text word for word, so a separate machine translation would never match; those lists are curated by hand per language.
const SKIP_KEY_PATTERNS = [/^chatbot\.highlightPhrases\./, /(^|\.)(email|phone|fax)$/i, /(^|\.)(address\d*|contactAddressLine\d+)$/i];

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isMissing(value) {
  return value === undefined || value === null || value === '' ||
    (typeof value === 'string' && value.startsWith('[UNTRANSLATED:'));
}

// Text that has no words to translate (phone numbers, emails, URLs, addresses).
function isTranslatable(text) {
  return /[A-Za-z]{3,}/.test(text) && !/@|https?:\/\//i.test(text);
}

// Placeholders such as {{name}} and $t(other.key) must survive translation. They are swapped for sentinels before sending and restored afterwards.
const PLACEHOLDER = /\{\{[^}]+\}\}|\$t\([^)]+\)|<[^>]+>/g;

function protect(text) {
  const saved = [];
  const masked = String(text).replace(PLACEHOLDER, (match) => {
    saved.push(match);
    return `XQ${saved.length - 1}X`;
  });
  return { masked, saved };
}

function restore(text, saved) {
  let out = text;
  for (let i = 0; i < saved.length; i += 1) {
    const token = new RegExp(`XQ\\s*${i}\\s*X`);
    if (!token.test(out)) throw new Error(`placeholder ${saved[i]} was lost in translation`);
    out = out.replace(token, saved[i]);
  }
  return out;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function api(pathname, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${TRANSLATE_URL}${pathname}`, { ...options, signal: controller.signal });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} ${detail.slice(0, 120)}`.trim());
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

const endpointCode = (locale) => CODE_MAP[locale] || locale;

async function translateText(text, locale) {
  const { masked, saved } = protect(text);
  const body = { q: masked, source: CANONICAL_LOCALE, target: endpointCode(locale), format: 'text' };
  if (API_KEY) body.api_key = API_KEY;
  const result = await api('/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!result || typeof result.translatedText !== 'string' || !result.translatedText.trim()) {
    throw new Error('empty translation returned');
  }
  if (DELAY_MS) await sleep(DELAY_MS);
  return restore(result.translatedText, saved);
}

function needsWork(oldValue, sourceValue) {
  if (typeof sourceValue !== 'string') return isMissing(oldValue);
  const englishCopy = typeof oldValue === 'string' && oldValue === sourceValue && isTranslatable(oldValue);
  return isMissing(oldValue) || englishCopy;
}

// Walks the English tree. Objects and arrays recurse; strings are the leaves.
async function sync(source, existing, locale, stats, keyPath = '') {
  const isArray = Array.isArray(source);
  const result = isArray ? [] : {};
  const keys = isArray ? source.map((_, i) => i) : Object.keys(source);

  for (const key of keys) {
    const sourceValue = source[key];
    const oldValue = existing?.[key];
    const currentPath = keyPath ? `${keyPath}.${key}` : String(key);

    if (isObject(sourceValue) || Array.isArray(sourceValue)) {
      const child = await sync(sourceValue, isObject(oldValue) || Array.isArray(oldValue) ? oldValue : undefined, locale, stats, currentPath);
      // A branch whose strings were all skipped is left out so i18next falls back to English.
      if (countLeaves(child) === 0 && countLeaves(sourceValue) > 0) continue;
      result[key] = child;
      continue;
    }

    if (typeof sourceValue !== 'string') { result[key] = oldValue ?? sourceValue; continue; }

    const skip = SKIP_KEY_PATTERNS.some((p) => p.test(currentPath)) || !isTranslatable(sourceValue);
    const missing = needsWork(oldValue, sourceValue);

    if (skip) {
      // Keep what is there; fall back to the English value for things like emails.
      result[key] = isMissing(oldValue) ? (isTranslatable(sourceValue) ? undefined : sourceValue) : oldValue;
      if (result[key] === undefined) { delete result[key]; if (missing) stats.skipped.push(currentPath); }
      continue;
    }

    if (!missing && !OVERWRITE_EXISTING) {
      result[key] = oldValue;
      stats.preserved += 1;
      continue;
    }

    if (SHOULD_TRANSLATE) {
      try {
        result[key] = await translateText(sourceValue, locale);
        stats.translated.push(currentPath);
      } catch (error) {
        if (!isMissing(oldValue)) result[key] = oldValue; // never lose an existing value
        else if (MARK_UNTRANSLATED) result[key] = `[UNTRANSLATED: ${locale}] ${sourceValue}`;
        stats.errors.push(`${currentPath}: ${error.message}`);
      }
    } else if (MARK_UNTRANSLATED && isMissing(oldValue)) {
      result[key] = `[UNTRANSLATED: ${locale}] ${sourceValue}`;
      stats.missing.push(currentPath);
    } else {
      // Offline / check mode: leave the key absent so i18next falls back to English instead of showing "[UNTRANSLATED]" text on the website.
      if (!isMissing(oldValue)) result[key] = oldValue;
      stats.missing.push(currentPath);
    }
  }
  return isArray ? result.filter((v) => v !== undefined) : result;
}

function countLeaves(value) {
  if (!isObject(value) && !Array.isArray(value)) return 1;
  if (Array.isArray(value) && value.length === 0) return 0;
  return Object.values(value).reduce((sum, child) => sum + countLeaves(child), 0);
}

async function supportedLanguages() {
  const list = await api('/languages');
  return new Map(list.map((l) => [l.code, l]));
}

async function main() {
  if ((SHOULD_TRANSLATE || LIST_LANGUAGES || ALL_SUPPORTED) && !TRANSLATE_URL) {
    console.error('Set LIBRETRANSLATE_URL to a LibreTranslate-compatible endpoint (for example http://localhost:5000).');
    process.exitCode = 1;
    return;
  }
  if (OVERWRITE_EXISTING && !SHOULD_TRANSLATE) {
    console.error('--overwrite requires --translate-missing (it replaces hand-written text with machine translation).');
    process.exitCode = 1;
    return;
  }

  let languages = null;
  if (TRANSLATE_URL && (SHOULD_TRANSLATE || LIST_LANGUAGES || ALL_SUPPORTED)) {
    try {
      languages = await supportedLanguages();
    } catch (error) {
      console.error(`Could not reach ${TRANSLATE_URL}/languages: ${error.message}`);
      process.exitCode = 1;
      return;
    }
  }

  if (LIST_LANGUAGES) {
    console.log(`${languages.size} languages at ${TRANSLATE_URL}:`);
    for (const [code, lang] of languages) console.log(`  ${code.padEnd(8)} ${lang.name}`);
    return;
  }

  const existingFolders = fs.readdirSync(LOCALES_DIR).filter((d) => d !== CANONICAL_LOCALE && fs.existsSync(path.join(LOCALES_DIR, d, 'translation.json')));
  let targets = option('locales') ? option('locales').split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_LOCALES;
  if (ALL_SUPPORTED) {
    targets = [...new Set([...existingFolders, ...[...languages.keys()].filter((c) => c !== CANONICAL_LOCALE)])];
  }

  const sourcePath = path.join(LOCALES_DIR, CANONICAL_LOCALE, 'translation.json');
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  console.log(`Loaded ${countLeaves(source)} English strings.`);

  const report = { generatedAt: new Date().toISOString(), endpoint: TRANSLATE_URL || null, locales: {} };
  let hasErrors = false;

  for (const locale of targets) {
    if (SHOULD_TRANSLATE && languages && !languages.has(endpointCode(locale))) {
      console.warn(`\n${locale}: not supported by this endpoint (see --list-languages). Skipped.`);
      report.locales[locale] = { skipped: 'unsupported by endpoint' };
      continue;
    }

    const directory = path.join(LOCALES_DIR, locale);
    const targetPath = path.join(directory, 'translation.json');
    let existing = {};
    if (fs.existsSync(targetPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      } catch (error) {
        console.error(`\n${locale}: cannot parse ${targetPath}: ${error.message}. Nothing written.`);
        hasErrors = true;
        continue;
      }
    }

    const stats = { translated: [], preserved: 0, missing: [], skipped: [], errors: [] };
    const merged = await sync(source, existing, locale, stats);

    const writes = SHOULD_TRANSLATE || MARK_UNTRANSLATED;
    if (writes && !DRY_RUN && !CHECK_ONLY) {
      fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(targetPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
    }

    console.log(`\n${locale}: translated ${stats.translated.length}, kept ${stats.preserved}, still missing ${stats.missing.length}, skipped (not machine-translatable) ${stats.skipped.length}, errors ${stats.errors.length}`);
    if (stats.missing.length) console.log(`  first missing: ${stats.missing.slice(0, 6).join(', ')}`);
    if (stats.errors.length) { hasErrors = true; console.warn(`  errors: ${stats.errors.slice(0, 4).join(' | ')}`); }
    report.locales[locale] = { translated: stats.translated, missing: stats.missing, skipped: stats.skipped, errors: stats.errors };
  }

  if (SHOULD_TRANSLATE && !DRY_RUN) {
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(`\nMachine-translated keys are listed in ${path.relative(process.cwd(), REPORT_PATH)} so a fluent speaker can review them.`);
  }
  if (hasErrors) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Translation generation failed: ${error.message}`);
  process.exitCode = 1;
});
