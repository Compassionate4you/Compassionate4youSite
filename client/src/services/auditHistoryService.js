//  * Task: DT-506
//  * Author: PBall
//  * Sprint: Sprint 6

//DT-492 Content Editor - Preston Ball: Storage key used to persist content audit records in local storage
const AUDIT_STORAGE_KEY = 'cms_content_audit_logs';

//DT-492 Content Editor - Preston Ball: Service providing read, write, and status update operations for content change history
export const AuditHistoryService = {
  //DT-492 Content Editor - Preston Ball: Retrieves all stored audit entries from localStorage, returning an empty array if empty or parsing fails
  getLogs() {
    try {
      const logs = localStorage.getItem(AUDIT_STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch {
      //DT-492 Content Editor - Preston Ball: Fallback for JSON parse failures or restricted localStorage access
      return [];
    }
  },

  //DT-492 Content Editor - Preston Ball: Filters audit logs matching a specific content field or path
  getLogsForKey(keyPath) {
    //DT-492 Content Editor - Preston Ball: Normalize array paths into dot-notation strings to ensure consistent matching
    const pathStr = Array.isArray(keyPath) ? keyPath.join('.') : keyPath;
    return this.getLogs().filter((log) => log.keyPath === pathStr);
  },

  //DT-492 Content Editor - Preston Ball: Creates and prepends a new audit record, persisting the updated history to localStorage
  recordChange({ keyPath, previousValue, newValue, author = 'Admin User', status = 'applied' }) {
    //DT-492 Content Editor - Preston Ball: Standardize the keyPath representation before creating the log payload
    const pathStr = Array.isArray(keyPath) ? keyPath.join('.') : keyPath;
    //DT-492 Content Editor - Preston Ball: Construct the audit record with a unique timestamp-based identifier and ISO timestamp
    const logEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      keyPath: pathStr,
      previousValue,
      newValue,
      author,
      timestamp: new Date().toISOString(),
      status,
    };

    //DT-492 Content Editor - Preston Ball: Prepend new entry to maintain chronological order with most recent first
    const existingLogs = this.getLogs();
    const updated = [logEntry, ...existingLogs];
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      //DT-492 Content Editor - Preston Ball: Log storage failures (e.g., quota exceeded) without interrupting caller execution
      console.error('Failed to persist audit log:', err);
    }
    return logEntry;
  },

  //DT-492 Content Editor - Preston Ball: Updates the operational status of an existing log entry by ID and saves the changes
  markStatus(logId, status) {
    //DT-492 Content Editor - Preston Ball: Locate target record by ID, apply the updated status, and re-serialize the log collection
    const logs = this.getLogs().map((l) => (l.id === logId ? { ...l, status } : l));
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    return logs;
  },
};