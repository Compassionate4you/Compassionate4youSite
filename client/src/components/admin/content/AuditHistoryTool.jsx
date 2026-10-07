// DT-515 Sprint 7
// PBall
// Audit History Tool displaying applied changes with JSON diffs and undo confirmation

import React, { useState } from 'react'
import { AuditHistoryService } from '../../../services/auditHistoryService'

export default function AuditHistoryTool ({ onNotification }) {
  const [logs, setLogs] = useState(AuditHistoryService.getLogs())

  const handleUndo = (logId) => {
    if (!window.confirm('Are you sure you want to undo this change?')) return
    try {
      AuditHistoryService.undoAppliedChange(logId)
      setLogs(AuditHistoryService.getLogs())
      onNotification(`Successfully undid change ${logId}`)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="content-editor-card">
      <h2>Applied Change Audit History</h2>
      <p className="content-editor-card-description">
        Review database applied change logs (hex ID, user UUID, timestamp, JSON diffs) and perform rollbacks.
      </p>

      {logs.length === 0 ? (
        <p style={{ marginTop: '20px', color: '#64748b' }}>No audit history records found.</p>
      ) : (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {logs.map((log) => (
            <div key={log.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{log.id}</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>User UUID: {log.user}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(log.time).toLocaleString()}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: log.status === 'undone' ? '#fee2e2' : '#e0f2fe', color: log.status === 'undone' ? '#991b1b' : '#0369a1' }}>
                    {log.status}
                  </span>
                </div>
              </div>

              {/* JSON Diff Details */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'monospace', overflowX: 'auto' }}>
                {log.changeContent?.additions?.length > 0 && (
                  <div style={{ color: '#166534', marginBottom: '6px' }}>
                    <strong>Additions:</strong> {JSON.stringify(log.changeContent.additions)}
                  </div>
                )}
                {log.changeContent?.deletions?.length > 0 && (
                  <div style={{ color: '#991b1b', marginBottom: '6px' }}>
                    <strong>Deletions:</strong> {JSON.stringify(log.changeContent.deletions)}
                  </div>
                )}
                {log.changeContent?.edits && Object.keys(log.changeContent.edits).length > 0 && (
                  <div>
                    <strong>Edits:</strong>
                    <pre style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{JSON.stringify(log.changeContent.edits, null, 2)}</pre>
                  </div>
                )}
              </div>

              {log.status !== 'undone' && (
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => handleUndo(log.id)}
                    style={{ padding: '6px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Undo Change (Are you sure?)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
