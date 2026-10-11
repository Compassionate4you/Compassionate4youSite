// DT-515 Sprint 7
// PBall
// Service handling applied change audit records and safe rollbacks / undo functionality

const AUDIT_STORAGE_KEY = 'cms_applied_change_audit_logs'

export const AuditHistoryService = {
  getLogs () {
    try {
      const logs = localStorage.getItem(AUDIT_STORAGE_KEY)
      return logs ? JSON.parse(logs) : []
    } catch {
      return []
    }
  },

  recordAppliedChange ({ additions = [], deletions = [], edits = {}, userId = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', status = 'applied' }) {
    const randomHex = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').substring(0, 16) : Math.random().toString(16).substring(2, 18)

    const logEntry = {
      id: randomHex,
      user: userId,
      time: new Date().toISOString(),
      status,
      changeContent: {
        additions,
        deletions,
        edits
      }
    }

    const existing = this.getLogs()
    const updated = [logEntry, ...existing]

    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to persist applied change audit log:', err)
    }

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbRecordAppliedChange (logData) {
     *   const res = await fetch('/api/admin/content/applied-changes', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(logData)
     *   })
     *   if (!res.ok) throw new Error('Database audit record failed')
     *   return await res.json()
     * }
     * await dbRecordAppliedChange(logEntry)
     */

    return logEntry
  },

  undoAppliedChange (logId) {
    const logs = this.getLogs()
    const targetLog = logs.find(l => l.id === logId)
    if (!targetLog) {
      throw new Error(`Audit log entry with ID "${logId}" not found`)
    }

    if (targetLog.status === 'undone' || targetLog.status === 'reverted') {
      throw new Error('This change has already been undone.')
    }

    const { additions = [], deletions = [], edits = {} } = targetLog.changeContent

    const updatedLogs = logs.map(l => l.id === logId ? { ...l, status: 'undone' } : l)
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedLogs))

    /*
     * DATABASE INTEGRATION (COMMENTED OUT UNTIL SITE RESTRUCTURING IS COMPLETED)
     * async function dbUndoChange (changeId) {
     *   const res = await fetch(`/api/admin/content/applied-changes/${changeId}/undo`, {
     *     method: 'POST'
     *   })
     *   if (!res.ok) throw new Error('Database undo transaction failed')
     *   return await res.json()
     * }
     * await dbUndoChange(logId)
     */

    return { success: true, undoneId: logId, additions, deletions, edits }
  },

  recordChange ({ keyPath, previousValue, newValue, author = 'Admin User', status = 'applied' }) {
    const pathStr = Array.isArray(keyPath) ? keyPath.join('.') : keyPath
    return this.recordAppliedChange({
      additions: [],
      deletions: [],
      edits: {
        [pathStr]: { before: previousValue, after: newValue }
      },
      status
    })
  },

  markStatus (logId, status) {
    const logs = this.getLogs().map(l => l.id === logId ? { ...l, status } : l)
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs))
    return logs
  }
}
