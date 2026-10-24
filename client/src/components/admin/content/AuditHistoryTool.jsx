// DT-618 Sprint 8
// Preston Ball
// Audit History Tool displaying database applied changes with human-readable diffs and expandable dropdowns

import React, { useState, useEffect } from 'react'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import { ChevronDown, ChevronRight, RotateCcw, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AuditHistoryTool ({ onNotification }) {
  const [logs, setLogs] = useState(AuditHistoryService.getLogs())
  const [expandedLogIds, setExpandedLogIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [showRawJson, setShowRawJson] = useState({})

  // DT-791 Sprint 8 - Preston Ball: Load applied changes from database on mount
  useEffect(() => {
    async function fetchLogs () {
      setLoading(true)
      try {
        const dbLogs = await AuditHistoryService.loadFromDatabase()
        setLogs(dbLogs)
      } catch (err) {
        console.error('Error loading audit logs from database:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  // DT-793 Sprint 8 - Preston Ball: Toggle dropdown expansion for an individual log item
  const toggleExpand = (logId) => {
    setExpandedLogIds((prev) => {
      const next = new Set(prev)
      if (next.has(logId)) {
        next.delete(logId)
      } else {
        next.add(logId)
      }
      return next
    })
  }

  // DT-791 Sprint 8 - Preston Ball: Handle undoing a change through the database API
  const handleUndo = async (logId) => {
    if (!window.confirm('Are you sure you want to undo this change? Previous values will be restored.')) return
    try {
      await AuditHistoryService.undoAppliedChange(logId)
      const refreshed = await AuditHistoryService.loadFromDatabase()
      setLogs(refreshed)
      onNotification(`Successfully undid change ${logId}`)
    } catch (err) {
      alert(err.message)
    }
  }

  const toggleRaw = (logId) => {
    setShowRawJson((prev) => ({ ...prev, [logId]: !prev[logId] }))
  }

  // DT-792 Sprint 8 - Preston Ball: Compute a concise human-readable summary of a change
  const getChangeSummary = (changeContent) => {
    if (!changeContent) return 'System record'
    const parts = []
    const additions = changeContent.additions || []
    const deletions = changeContent.deletions || []
    const edits = changeContent.edits || {}

    if (additions.length > 0) {
      const types = additions.map(a => a.type || 'item').join(', ')
      parts.push(`Created ${additions.length} ${types}`)
    }
    if (deletions.length > 0) {
      const types = deletions.map(d => d.type || 'item').join(', ')
      parts.push(`Deleted ${deletions.length} ${types}`)
    }
    const editKeys = Object.keys(edits)
    if (editKeys.length > 0) {
      const keysSummary = editKeys.map(k => k.replace(/^(section|card|page|color)\./, '$1: ')).slice(0, 2).join(', ')
      parts.push(`Updated ${keysSummary}${editKeys.length > 2 ? ` (+${editKeys.length - 2} more)` : ''}`)
    }

    return parts.length > 0 ? parts.join(' • ') : 'Configuration change'
  }

  // DT-792 Sprint 8 - Preston Ball: Render human-readable diff details
  const renderReadableDiff = (changeContent) => {
    if (!changeContent) return <p style={{ color: '#94a3b8' }}>No detail content recorded.</p>
    const additions = changeContent.additions || []
    const deletions = changeContent.deletions || []
    const edits = changeContent.edits || {}

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Additions */}
        {additions.length > 0 && (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#15803d', marginBottom: '6px' }}>
              + Additions ({additions.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {additions.map((item, idx) => (
                <div key={idx} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: '600', color: '#166534' }}>
                    Type: <span style={{ textTransform: 'capitalize' }}>{item.type || 'Element'}</span> — ID: <code>{item.id}</code>
                  </div>
                  {item.data && (
                    <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#334155' }}>
                      {item.data.content?.title && <div>Title: <strong>{item.data.content.title}</strong></div>}
                      {item.data.content?.header && <div>Header: <strong>{item.data.content.header}</strong></div>}
                      {item.data.layout && <div>Layout: <code>{item.data.layout}</code></div>}
                      {item.data.lightModeColor && <div>Light / Dark Color: <code>{item.data.lightModeColor}</code> / <code>{item.data.darkModeColor}</code></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deletions */}
        {deletions.length > 0 && (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#b91c1c', marginBottom: '6px' }}>
              − Deletions ({deletions.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {deletions.map((item, idx) => (
                <div key={idx} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: '600', color: '#991b1b' }}>
                    Removed <span style={{ textTransform: 'capitalize' }}>{item.type || 'Element'}</span>: <code>{item.id}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edits */}
        {Object.keys(edits).length > 0 && (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0369a1', marginBottom: '6px' }}>
              ✎ Modifications ({Object.keys(edits).length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(edits).map(([key, diff]) => {
                const before = diff?.before
                const after = diff?.after

                return (
                  <div key={key} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                      Target: <code>{key}</code>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {/* Before */}
                      <div style={{ background: '#fee2e2', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#991b1b', marginBottom: '4px' }}>PREVIOUS STATE</div>
                        <div style={{ fontSize: '0.85rem', color: '#7f1d1d', wordBreak: 'break-word' }}>
                          {typeof before === 'object' && before !== null ? (
                            <div>
                              {before.content?.title && <div>Title: {before.content.title}</div>}
                              {before.content?.header && <div>Header: {before.content.header}</div>}
                              {before.content?.text && <div>Text: {before.content.text}</div>}
                              {before.layout && <div>Layout: {before.layout}</div>}
                              {before.lightModeColor && <div>Colors: {before.lightModeColor} / {before.darkModeColor}</div>}
                              {!before.content && !before.layout && !before.lightModeColor && JSON.stringify(before)}
                            </div>
                          ) : (
                            String(before ?? 'none')
                          )}
                        </div>
                      </div>

                      {/* After */}
                      <div style={{ background: '#dcfce7', padding: '8px 12px', borderRadius: '6px', border: '1px solid #86efac' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#166534', marginBottom: '4px' }}>UPDATED STATE</div>
                        <div style={{ fontSize: '0.85rem', color: '#14532d', wordBreak: 'break-word' }}>
                          {typeof after === 'object' && after !== null ? (
                            <div>
                              {after.content?.title && <div>Title: {after.content.title}</div>}
                              {after.content?.header && <div>Header: {after.content.header}</div>}
                              {after.content?.text && <div>Text: {after.content.text}</div>}
                              {after.layout && <div>Layout: {after.layout}</div>}
                              {after.lightModeColor && <div>Colors: {after.lightModeColor} / {after.darkModeColor}</div>}
                              {!after.content && !after.layout && !after.lightModeColor && JSON.stringify(after)}
                            </div>
                          ) : (
                            String(after ?? 'none')
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="content-editor-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Applied Change Audit History</h2>
          <p className="content-editor-card-description">
            Review database applied changes with structured before/after diffs and perform safe rollbacks.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            const reloaded = await AuditHistoryService.loadFromDatabase()
            setLogs(reloaded)
            onNotification('Refreshed audit history from database.')
          }}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
        >
          ↻ Refresh from DB
        </button>
      </div>

      {loading && <p style={{ marginTop: '16px', color: '#64748b' }}>Loading database audit history...</p>}

      {!loading && logs.length === 0 ? (
        <div style={{ marginTop: '24px', padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b', margin: 0 }}>No audit history records found in the database.</p>
        </div>
      ) : (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.map((log) => {
            const isExpanded = expandedLogIds.has(log.id)
            const summary = getChangeSummary(log.changeContent)

            return (
              <div
                key={log.id}
                style={{
                  border: isExpanded ? '1px solid #94a3b8' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  background: '#ffffff',
                  boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* DT-793 Sprint 8 - Preston Ball: Dropdown header row toggle */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isExpanded ? '#f8fafc' : '#ffffff',
                    borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </span>

                    <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.85rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                      #{log.id.substring(0, 10)}
                    </span>

                    <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>
                      {summary}
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                      <User size={13} /> {log.user ? `${log.user.substring(0, 8)}...` : 'Admin'}
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                      <Clock size={13} /> {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: log.status === 'undone' ? '#fee2e2' : '#dcfce7',
                        color: log.status === 'undone' ? '#991b1b' : '#166534',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {log.status === 'undone' ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                      {log.status}
                    </span>
                  </div>
                </div>

                {/* DT-793 Sprint 8 - Preston Ball: Dropdown expanded body hiding detailed changes until opened */}
                {isExpanded && (
                  <div style={{ padding: '18px', background: '#ffffff' }}>
                    {/* Human readable diff */}
                    {renderReadableDiff(log.changeContent)}

                    {/* Secondary option to view raw json diff */}
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRaw(log.id)
                        }}
                        style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                      >
                        {showRawJson[log.id] ? 'Hide raw JSON diff' : 'Show raw JSON diff'}
                      </button>

                      {log.status !== 'undone' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUndo(log.id)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          <RotateCcw size={14} /> Undo Change
                        </button>
                      )}
                    </div>

                    {showRawJson[log.id] && (
                      <pre style={{ marginTop: '10px', background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '0.8rem', overflowX: 'auto', border: '1px solid #e2e8f0' }}>
                        {JSON.stringify(log.changeContent, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

