/**
 * Task: DT-503
 * Author: PBall
 * Sprint: Sprint 6
 */

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