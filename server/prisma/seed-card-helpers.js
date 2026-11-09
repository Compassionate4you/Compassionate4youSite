const fs = require('fs');
const path = require('path');

const LANGUAGES = ['en', 'es', 'pa', 'ur', 'zh', 'vi', 'hi'];
const LOCALES_DIR = path.resolve(__dirname, '../../client/src/locales');

function get(object, keyPath) {
    return keyPath
        .split('.')
        .reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), object);
}

function stripDash(text) {
    return String(text).replace(/^\s*-\s*/, '').trim();
}

// Hospice cards 3 and 6 store { top, list1, list2... }. Cards keep one text
// field, so bullets become lines starting with "- ".
function flattenText(value) {
    if (typeof value === 'string') return value.trim();
    if (value && typeof value === 'object') {
        const { top, ...rest } = value;
        const items = Object.keys(rest)
            .filter((key) => /^list\d+$/.test(key))
            .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)))
            .map((key) => `- ${stripDash(rest[key])}`);
        return [top ? stripDash(top) : null, ...items].filter(Boolean).join('\n');
    }
    return '';
}

// { en: '...', es: '...' } from one translation key. Skips languages that lack
// the key, and values the translation script marked "[UNTRANSLATED: xx]".
function perLanguage(locales, keyPath) {
    const result = {};
    for (const [language, dictionary] of Object.entries(locales)) {
        const raw = get(dictionary, keyPath);
        if (raw === undefined) continue;
        const text = flattenText(raw);
        if (!text || text.startsWith('[UNTRANSLATED')) continue;
        result[language] = text;
    }
    return result;
}

function loadLocales(dir = LOCALES_DIR) {
    const locales = {};
    for (const language of LANGUAGES) {
        const file = path.join(dir, language, 'translation.json');
        if (!fs.existsSync(file)) {
            console.warn(`No translation file for "${language}" - skipping.`);
            continue;
        }
        try {
            locales[language] = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (err) {
            console.warn(`Could not read ${file}: ${err.message} - skipping.`);
        }
    }
    return locales;
}

module.exports = { flattenText, get, loadLocales, perLanguage, stripDash };
