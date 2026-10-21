/**
 * Task: DT-503
 * Author: PBall
 * Sprint: Sprint 6
 */
/* ---------- delete line if undoing 1 of 3
//DT-492 Content Editor - Preston Ball: Core Node.js file system module for reading, writing, and checking translation files
const fs = require('fs');
//DT-492 Content Editor - Preston Ball: Path module to safely construct cross-platform file and directory paths
const path = require('path');

//DT-492 Content Editor - Preston Ball: Absolute path pointing to the frontend locales directory
const LOCALES_DIR = path.resolve(__dirname, '../client/src/locales');
//DT-492 Content Editor - Preston Ball: Source-of-truth locale code from which all other translations originate
const CANONICAL_LOCALE = 'en';
//DT-492 Content Editor - Preston Ball: List of target locale directories to keep synchronized with the source dictionary
const TARGET_LOCALES = ['es', 'pa'];

/**
 * Deep merge canonical dictionary into target dictionary.
 * Preserves existing target translations and flags missing keys.
 */
  /* --------------------- delete line if undoing 2 of 3
//DT-492 Content Editor - Preston Ball: Recursively synchronizes key trees from the canonical locale into a target locale object
function syncDictionaries(canonical, target, locale) {
  //DT-492 Content Editor - Preston Ball: Maintain structure compatibility by mirroring array or object root container types
  const result = Array.isArray(canonical) ? [] : {};

  //DT-492 Content Editor - Preston Ball: Iterate through each key present in the canonical dictionary
  for (const key of Object.keys(canonical)) {
    const canonicalVal = canonical[key];
    const targetVal = target ? target[key] : undefined;

    //DT-492 Content Editor - Preston Ball: If current key is a nested object, recurse deeper into the dictionary tree
    if (
      canonicalVal !== null &&
      typeof canonicalVal === 'object' &&
      !Array.isArray(canonicalVal)
    ) {
      result[key] = syncDictionaries(
        canonicalVal,
        typeof targetVal === 'object' && targetVal !== null ? targetVal : {},
        locale
      );
    } else {
      //DT-492 Content Editor - Preston Ball: Preserve existing translation if already present and non-empty
      if (targetVal !== undefined && targetVal !== null && targetVal !== '') {
        result[key] = targetVal;
      } else {
        // Backfill with untranslated tag
        //DT-492 Content Editor - Preston Ball: Append untranslated locale prefix to canonical text when target string is missing
        result[key] = `[UNTRANSLATED: ${locale}] ${canonicalVal}`;
      }
    }
  }

  //DT-492 Content Editor - Preston Ball: Return the deeply merged dictionary result for serialization
  return result;
}

//DT-492 Content Editor - Preston Ball: Main execution routine to read canonical translations and synchronize across all target locale files
function runTranslationGenerator() {
  //DT-492 Content Editor - Preston Ball: Resolve file path for the canonical English translation file
  const canonicalPath = path.join(LOCALES_DIR, CANONICAL_LOCALE, 'translation.json');

  //DT-492 Content Editor - Preston Ball: Validate existence of canonical dictionary file before proceeding
  if (!fs.existsSync(canonicalPath)) {
    console.error(`Canonical translation file missing at: ${canonicalPath}`);
    process.exit(1);
  }

  //DT-492 Content Editor - Preston Ball: Read and parse the base canonical JSON dictionary into memory
  const canonicalContent = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
  console.log(`Ingested canonical dictionary (${CANONICAL_LOCALE}) successfully.`);

  //DT-492 Content Editor - Preston Ball: Process each target locale defined in TARGET_LOCALES sequentially
  for (const locale of TARGET_LOCALES) {
    const localeDir = path.join(LOCALES_DIR, locale);
    const localeFilePath = path.join(localeDir, 'translation.json');

    //DT-492 Content Editor - Preston Ball: Create target directory recursively if it does not yet exist
    if (!fs.existsSync(localeDir)) {
      fs.mkdirSync(localeDir, { recursive: true });
    }

    //DT-492 Content Editor - Preston Ball: Load existing translations if present to avoid overwriting previously localized values
    let existingLocaleContent = {};
    if (fs.existsSync(localeFilePath)) {
      try {
        existingLocaleContent = JSON.parse(fs.readFileSync(localeFilePath, 'utf8'));
      } catch (e) {
        //DT-492 Content Editor - Preston Ball: Catch corrupted or unparseable JSON files and fallback to an empty target
        console.warn(`Could not parse existing translation for ${locale}, starting fresh.`);
      }
    }

    //DT-492 Content Editor - Preston Ball: Merge dictionaries and write formatted JSON with 2-space indentation back to disk
    const mergedContent = syncDictionaries(canonicalContent, existingLocaleContent, locale);
    fs.writeFileSync(localeFilePath, JSON.stringify(mergedContent, null, 2), 'utf8');
    console.log(`Synchronized locale file: ${localeFilePath}`);
  }

  //DT-492 Content Editor - Preston Ball: Log overall task completion message
  console.log('Automated translation generation complete.');
}

//DT-492 Content Editor - Preston Ball: Trigger generator entrypoint
runTranslationGenerator();

*/ //------------------ delete line if undo 3 of 3

/*
DT 650 script to generate language files
Generate/synchronize locale JSON files from the main English file.
Default mode is offline and free: it synchronizes keys and preserves existing translations. Missing values are marked for review.
Optional real translation mode uses a LibreTranslate-compatible endpoint: ++++++++++++++
LIBRETRANSLATE_URL=http://localhost:5000 npm run generate:translations -- --translate-missing
A locally hosted LibreTranslate server can avoid per-character API fees. A public endpoint may have rate limits or availability restrictions.
*/

const fs = require('node:fs');
const path = require('node:path');

const LOCALES_DIR = path.resolve(__dirname, '../client/src/locales');
const CANONICAL_LOCALE = 'en';
const TARGET_LOCALES = ['es', 'pa', 'ur'];
const SHOULD_TRANSLATE = process.argv.includes('--translate-missing');
const OVERWRITE_EXISTING = process.argv.includes('--overwrite');
const TRANSLATE_URL = (process.env.LIBRETRANSLATE_URL || '').replace(/\/$/, '');
const API_KEY = process.env.LIBRETRANSLATE_API_KEY;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isMissingTranslation(value) {
  return value === undefined || value === null || value === '' ||
    (typeof value === 'string' && value.startsWith('[UNTRANSLATED:'));
}

async function translateText(text, locale) {
  if (!TRANSLATE_URL) {
    throw new Error('Set LIBRETRANSLATE_URL to a LibreTranslate-compatible endpoint to enable actual translation.');
  }
  const body = {
    q: String(text),
    source: 'en',
    target: locale,
    format: 'text',
  };
  if (API_KEY) body.api_key = API_KEY;

  const response = await fetch(`${TRANSLATE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Translation service returned HTTP ${response.status}`);
  const result = await response.json();
  if (!result || typeof result.translatedText !== 'string' || !result.translatedText.trim()) {
    throw new Error('Translation service returned an empty translation.');
  }
  return result.translatedText;
}

async function syncDictionaries(source, existing, locale, stats, keyPath = '') {
  const result = Array.isArray(source) ? [] : {};

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const oldValue = existing?.[key];
    const currentPath = keyPath ? `${keyPath}.${key}` : key;

    if (isObject(sourceValue)) {
      result[key] = await syncDictionaries(
        sourceValue,
        isObject(oldValue) ? oldValue : {},
        locale,
        stats,
        currentPath
      );
      continue;
    }

    const untranslatedEnglishCopy = SHOULD_TRANSLATE &&
      typeof oldValue === 'string' && oldValue === sourceValue && /[A-Za-z]{3,}/.test(oldValue) &&
      !/@|https?:\/\//i.test(oldValue);
    const missing = isMissingTranslation(oldValue) || untranslatedEnglishCopy;
    if (!missing && !OVERWRITE_EXISTING) {
      result[key] = oldValue;
      stats.preserved += 1;
      continue;
    }

    if (SHOULD_TRANSLATE) {
      try {
        result[key] = await translateText(sourceValue, locale);
        stats.translated += 1;
      } catch (error) {
        result[key] = `[UNTRANSLATED: ${locale}] ${sourceValue}`;
        stats.missing.push(currentPath);
        stats.errors.push(`${currentPath}: ${error.message}`);
      }
    } else {
      result[key] = missing
        ? `[UNTRANSLATED: ${locale}] ${sourceValue}`
        : sourceValue;
      if (missing) stats.missing.push(currentPath);
      else stats.preserved += 1;
    }
  }
  return result;
}

async function main() {
  const sourcePath = path.join(LOCALES_DIR, CANONICAL_LOCALE, 'translation.json');
  if (!fs.existsSync(sourcePath)) {
    console.error(`English source file not found: ${sourcePath}`);
    process.exitCode = 1;
    return;
  }

  if (OVERWRITE_EXISTING && !SHOULD_TRANSLATE) {
    console.error('--overwrite requires --translate-missing so existing translations are not replaced with English text.');
    process.exitCode = 1;
    return;
  }

  if (SHOULD_TRANSLATE && !TRANSLATE_URL) {
    console.error('Translation mode requested, but LIBRETRANSLATE_URL is not set.');
    console.error('Run without --translate-missing to synchronize keys offline, or configure a LibreTranslate-compatible endpoint.');
    process.exitCode = 1;
    return;
  }

  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const sourceKeyCount = countLeaves(source);
  console.log(`Loaded ${sourceKeyCount} English translation keys.`);

  let hasErrors = false;
  for (const locale of TARGET_LOCALES) {
    const directory = path.join(LOCALES_DIR, locale);
    const targetPath = path.join(directory, 'translation.json');
    fs.mkdirSync(directory, { recursive: true });

    let existing = {};
    if (fs.existsSync(targetPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      } catch (error) {
        console.error(`Could not parse ${targetPath}: ${error.message}`);
        console.error('No changes were written to this language file.');
        hasErrors = true;
        continue;
      }
    }

    const stats = { translated: 0, preserved: 0, missing: [], errors: [] };
    const merged = await syncDictionaries(source, existing, locale, stats);
    fs.writeFileSync(targetPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
    console.log(`\n${locale}: updated ${path.relative(process.cwd(), targetPath)}`);
    console.log(`  Translated: ${stats.translated}; preserved: ${stats.preserved}; missing/review: ${stats.missing.length}`);
    if (stats.missing.length) console.log(`  First missing keys: ${stats.missing.slice(0, 8).join(', ')}`);
    if (stats.errors.length) {
      hasErrors = true;
      console.warn(`  Translation errors: ${stats.errors.slice(0, 5).join(' | ')}`);
    }
  }

  if (hasErrors) process.exitCode = 1;
  console.log('\nLanguage-file generation finished. Review any [UNTRANSLATED: ...] entries before publishing.');
}

function countLeaves(value) {
  if (!isObject(value) && !Array.isArray(value)) return 1;
  return Object.values(value).reduce((sum, child) => sum + countLeaves(child), 0);
}

main().catch((error) => {
  console.error(`Translation generation failed: ${error.message}`);
  process.exitCode = 1;
});
