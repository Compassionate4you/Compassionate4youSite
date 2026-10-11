//  * Task: DT-502
//  * Author: PBall
//  * Sprint: Sprint 6

//DT-492 Content Editor - Preston Ball: Storage key for persisting in-memory translation overrides to localStorage
const STORAGE_KEY = 'cms_in_memory_translations';

//DT-492 Content Editor - Preston Ball: Store interface handling local in-memory caching and persistent browser storage for translations
export const InMemoryTranslationStore = {
  //DT-492 Content Editor - Preston Ball: Immediately invoked function initializing store data from localStorage or defaulting to an empty map
  data: (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      //DT-492 Content Editor - Preston Ball: Fallback in case of parse errors or unavailable storage
      return {};
    }
  })(),

  //DT-492 Content Editor - Preston Ball: Look up a translation string by its key path
  get(path) {
    return this.data[path];
  },

  //DT-492 Content Editor - Preston Ball: Return a shallow copy of the entire translations key-value mapping
  getAll() {
    return { ...this.data };
  },

  //DT-492 Content Editor - Preston Ball: Update a specific key path with a new value and sync the updated cache to localStorage
  update(path, value) {
    this.data[path] = value;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (err) {
      //DT-492 Content Editor - Preston Ball: Log storage persistence errors while preserving in-memory state
      console.error('Failed to persist in-memory store to localStorage:', err);
    }
    return this.data[path];
  },

  //DT-492 Content Editor - Preston Ball: Clear all cached translations from both memory and localStorage
  clear() {
    this.data = {};
    localStorage.removeItem(STORAGE_KEY);
  },
};

//DT-492 Content Editor - Preston Ball: Handles saving English copy overrides, formatting key paths and managing store state
export async function saveEnglishText(keyPath, englishText, authorId = 'Admin User') {
  //DT-492 Content Editor - Preston Ball: Standardize array-based key paths into a dot-delimited string
  const pathKey = Array.isArray(keyPath) ? keyPath.join('.') : keyPath;

  //DT-492 Content Editor - Preston Ball: Send the changed text to the local memory. Does not yet integrate with a backend database, but is structured for future expansion.
  InMemoryTranslationStore.update(pathKey, englishText);

  /* ============================================================
   * DATABASE INTEGRATION (COMMENTED OUT UNTIL TABLES ARE MIGRATED)
   * ============================================================
   * const response = await fetch('/api/admin/content/translations', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({
   *     keyPath: pathKey,
   *     locale: 'en',
   *     content: englishText,
   *     updatedBy: authorId,
   *     updatedAt: new Date().toISOString()
   *   })
   * });
   * if (!response.ok) throw new Error('Database transaction failed');
   * return await response.json();
   * ============================================================ */

  //DT-492 Content Editor - Preston Ball: Return a standardized operation receipt with timestamp and change metadata
  return {
    success: true,
    path: pathKey,
    value: englishText,
    author: authorId,
    timestamp: new Date().toISOString(),
  };
}