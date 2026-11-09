// DT-618 Sprint 8
// Preston Ball
// Service handling applied change audit records and safe rollbacks / undo functionality with database persistence

import { API_BASE_URL } from './api'

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

  // DT-618 Sprint 8 - Preston Ball: Load applied change logs from backend database
  async loadFromDatabase () {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/applied-changes`)
      if (res.ok) {
        const remoteLogs = await res.json()
        if (Array.isArray(remoteLogs)) {
          localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(remoteLogs))
          return remoteLogs
        }
      }
    } catch (err) {
      console.error('Failed to load applied changes from database:', err)
    }
    return this.getLogs()
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

    // DT-618 Sprint 8 - Preston Ball: Persist applied change to database
    async function dbRecordAppliedChange (logData) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/content/applied-changes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        })
        if (!res.ok) throw new Error('Database audit record failed')
        return await res.json()
      } catch (err) {
        console.error('Database audit record error:', err)
      }
    }
    dbRecordAppliedChange(logEntry)

    return logEntry
  },

  async undoAppliedChange (logId) {
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

    // DT-618 Sprint 8 - Preston Ball: Send undo request to database
    try {
      const res = await fetch(`${API_BASE_URL}/admin/content/applied-changes/${logId}/undo`, {
        method: 'POST'
      })
      if (!res.ok) {
        console.warn('Database undo transaction returned non-ok status:', res.status)
      }
    } catch (err) {
      console.error('Database undo transaction error:', err)
    }

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
