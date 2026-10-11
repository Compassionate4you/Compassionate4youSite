//  * Task: DT-503
//  * Author: PBall
//  * Sprint: Sprint 6

//DT-492 Content Editor - Preston Ball: List of target locale codes maintained for automatic English synchronization
const SYNCED_LOCALES = ['es', 'pa'];


//DT-492 Content Editor - Preston Ball: Deeply traverses and syncs new or updated English text paths into each target locale tree with untranslated tags
export function syncKeyToLocales(keyPath, englishText, existingLocales = {}) {
  //DT-492 Content Editor - Preston Ball: Ensure key segments are split into an array for nested property traversal
  const pathParts = Array.isArray(keyPath) ? keyPath : keyPath.split('.');
  //DT-492 Content Editor - Preston Ball: Shallow copy parent locales container to avoid mutating input reference directly
  const updatedLocales = { ...existingLocales };

  //DT-492 Content Editor - Preston Ball: Iterate through each supported target language
  for (const locale of SYNCED_LOCALES) {
    //DT-492 Content Editor - Preston Ball: Ensure a base root object exists for the current locale
    if (!updatedLocales[locale]) {
      updatedLocales[locale] = {};
    }

    //DT-492 Content Editor - Preston Ball: Pointer used to traverse and construct intermediate nested objects
    let pointer = updatedLocales[locale];
    for (let i = 0; i < pathParts.length - 1; i++) {
      const segment = pathParts[i];
      //DT-492 Content Editor - Preston Ball: Initialize intermediate object branch if it does not already exist
      if (!pointer[segment] || typeof pointer[segment] !== 'object') {
        pointer[segment] = {};
      }
      pointer = pointer[segment];
    }

    //DT-492 Content Editor - Preston Ball: Extract the leaf key for assigning the final translation string
    const lastKey = pathParts[pathParts.length - 1];
    
    //DT-492 Content Editor - Preston Ball: If untranslated or newly created, tag with locale identifier
    //DT-492 Content Editor - Preston Ball: In future, we would integrate a machine translation service here to provide actual translations.
    pointer[lastKey] = `[UNTRANSLATED: ${locale}] ${englishText}`;
  }

  //DT-492 Content Editor - Preston Ball: Return the updated locales tree containing the newly synchronized keys
  return updatedLocales;
}