// DT-618 DT-625 Sprint 8
// Preston Ball
// Audit History Tool displaying database applied changes with human-readable diffs, custom modal confirmations, and expandable dropdowns

import React, { useState, useEffect } from 'react'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import { ChevronDown, ChevronRight, RotateCcw, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react'
import CustomModal from './CustomModal'

export default function AuditHistoryTool ({ onNotification }) {
  const [logs, setLogs] = useState(AuditHistoryService.getLogs())
  const [expandedLogIds, setExpandedLogIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [showRawJson, setShowRawJson] = useState({})
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'Confirm',
    onConfirm: null
  })

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

  // DT-791 DT-625 Sprint 8 - Preston Ball: Handle undoing a change through the database API with CustomModal
  const handleUndo = (logId) => {
    setModalState({
      isOpen: true,
      title: 'Confirm Undo Change',
      message: `Are you sure you want to undo change #${logId.substring(0, 10)}? Previous values will be restored.`,
      type: 'confirm',
      confirmText: 'Undo Change',
      onConfirm: async () => {
        setModalState((prev) => ({ ...prev, isOpen: false }))
        try {
          await AuditHistoryService.undoAppliedChange(logId)
          const refreshed = await AuditHistoryService.loadFromDatabase()
          setLogs(refreshed)
          onNotification(`Successfully undid change ${logId}`)
        } catch (err) {
          setModalState({
            isOpen: true,
            title: 'Error Undoing Change',
            message: err.message || 'Failed to undo change.',
            type: 'alert',
            confirmText: 'OK',
            onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
          })
        }
      }
    })
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
                const before = diff?.before || {}
                const after = diff?.after || {}

                // DT-622 Sprint 8 - Preston Ball: Detailed Page section diff analysis
                const isPage = key.startsWith('page.')
                const isSection = key.startsWith('section.')
                const isCard = key.startsWith('card.')
                const isColor = key.startsWith('color.')

                const beforeSections = before.content?.sectionIds || []
                const afterSections = after.content?.sectionIds || []
                const addedSections = afterSections.filter(s => !beforeSections.includes(s))
                const removedSections = beforeSections.filter(s => !afterSections.includes(s))

                const beforeCards = before.content?.cardIds || []
                const afterCards = after.content?.cardIds || []
                const addedCards = afterCards.filter(c => !beforeCards.includes(c))
                const removedCards = beforeCards.filter(c => !afterCards.includes(c))

                return (
                  <div key={key} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>
                        Target: <code style={{ color: '#0369a1' }}>{key}</code>
                      </div>
                      {isPage && (addedSections.length > 0 || removedSections.length > 0) && (
                        <div style={{ display: 'flex', gap: '6px', fontSize: '12px' }}>
                          {addedSections.length > 0 && (
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                              +{addedSections.length} section{addedSections.length > 1 ? 's' : ''} added
                            </span>
                          )}
                          {removedSections.length > 0 && (
                            <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                              -{removedSections.length} section{removedSections.length > 1 ? 's' : ''} removed
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* DT-622 Sprint 8 - Preston Ball: Explicit Page Section Changes summary badge */}
                    {isPage && (addedSections.length > 0 || removedSections.length > 0) && (
                      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', marginBottom: '10px', fontSize: '13px' }}>
                        {addedSections.length > 0 && (
                          <div style={{ color: '#15803d', marginBottom: '4px' }}>
                            <strong>Added Sections:</strong> {addedSections.map(s => <code key={s} style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>{s}</code>)}
                          </div>
                        )}
                        {removedSections.length > 0 && (
                          <div style={{ color: '#b91c1c', marginBottom: '4px' }}>
                            <strong>Removed Sections:</strong> {removedSections.map(s => <code key={s} style={{ background: '#fee2e2', padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>{s}</code>)}
                          </div>
                        )}
                        <div style={{ color: '#64748b', fontSize: '12px' }}>
                          Count changed from <strong>{beforeSections.length}</strong> to <strong>{afterSections.length}</strong> sections.
                        </div>
                      </div>
                    )}

                    {/* DT-622 Sprint 8 - Preston Ball: Explicit Section Card Changes summary */}
                    {isSection && (addedCards.length > 0 || removedCards.length > 0) && (
                      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', marginBottom: '10px', fontSize: '13px' }}>
                        {addedCards.length > 0 && (
                          <div style={{ color: '#15803d', marginBottom: '4px' }}>
                            <strong>Added Cards:</strong> {addedCards.map(c => <code key={c} style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>{c}</code>)}
                          </div>
                        )}
                        {removedCards.length > 0 && (
                          <div style={{ color: '#b91c1c' }}>
                            <strong>Removed Cards:</strong> {removedCards.map(c => <code key={c} style={{ background: '#fee2e2', padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>{c}</code>)}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {/* Before State */}
                      <div style={{ background: '#fee2e2', padding: '10px 14px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#991b1b', marginBottom: '6px' }}>PREVIOUS STATE</div>
                        <div style={{ fontSize: '0.85rem', color: '#7f1d1d', wordBreak: 'break-word', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {isPage && (
                            <>
                              {before.content?.title && <div><strong>Title:</strong> {before.content.title}</div>}
                              <div><strong>Sections ({beforeSections.length}):</strong> [{beforeSections.join(', ') || 'none'}]</div>
                            </>
                          )}
                          {isSection && (
                            <>
                              {before.layout && <div><strong>Layout:</strong> <code>{before.layout}</code></div>}
                              {before.content?.header && <div><strong>Header:</strong> {before.content.header}</div>}
                              {before.content?.text && <div><strong>Text:</strong> {before.content.text}</div>}
                              {beforeCards.length > 0 && <div><strong>Cards ({beforeCards.length}):</strong> [{beforeCards.join(', ')}]</div>}
                              {before.content?.colors && (
                                <div style={{ fontSize: '12px' }}>
                                  <strong>Colors:</strong> BG: {before.content.colors.backgroundColor || 'none'}, Text: {before.content.colors.textColor || 'none'}
                                </div>
                              )}
                            </>
                          )}
                          {isCard && (
                            <>
                              {before.layout && <div><strong>Layout:</strong> <code>{before.layout}</code></div>}
                              {before.content?.header && <div><strong>Header:</strong> {before.content.header}</div>}
                              {before.content?.paragraph && <div><strong>Paragraph:</strong> {before.content.paragraph}</div>}
                              {before.content?.symbol && <div><strong>Symbol:</strong> {before.content.symbol}</div>}
                              {before.content?.imageUrl && <div><strong>Image:</strong> {before.content.imageUrl}</div>}
                              {before.content?.colors && (
                                <div style={{ fontSize: '12px' }}>
                                  <strong>Colors:</strong> BG: {before.content.colors.backgroundColor || 'none'}, Text: {before.content.colors.textColor || 'none'}
                                </div>
                              )}
                            </>
                          )}
                          {isColor && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <div style={{ width: '20px', height: '20px', background: before.lightModeColor, borderRadius: '4px', border: '1px solid #ccc' }} />
                              <span>☀️ {before.lightModeColor}</span>
                              <div style={{ width: '20px', height: '20px', background: before.darkModeColor, borderRadius: '4px', border: '1px solid #ccc' }} />
                              <span>🌙 {before.darkModeColor}</span>
                            </div>
                          )}
                          {!isPage && !isSection && !isCard && !isColor && (
                            <div>{JSON.stringify(before)}</div>
                          )}
                        </div>
                      </div>

                      {/* After State */}
                      <div style={{ background: '#dcfce7', padding: '10px 14px', borderRadius: '6px', border: '1px solid #86efac' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#166534', marginBottom: '6px' }}>UPDATED STATE</div>
                        <div style={{ fontSize: '0.85rem', color: '#14532d', wordBreak: 'break-word', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {isPage && (
                            <>
                              {after.content?.title && <div><strong>Title:</strong> {after.content.title}</div>}
                              <div><strong>Sections ({afterSections.length}):</strong> [{afterSections.join(', ') || 'none'}]</div>
                            </>
                          )}
                          {isSection && (
                            <>
                              {after.layout && <div><strong>Layout:</strong> <code>{after.layout}</code></div>}
                              {after.content?.header && <div><strong>Header:</strong> {after.content.header}</div>}
                              {after.content?.text && <div><strong>Text:</strong> {after.content.text}</div>}
                              {afterCards.length > 0 && <div><strong>Cards ({afterCards.length}):</strong> [{afterCards.join(', ')}]</div>}
                              {after.content?.colors && (
                                <div style={{ fontSize: '12px' }}>
                                  <strong>Colors:</strong> BG: {after.content.colors.backgroundColor || 'none'}, Text: {after.content.colors.textColor || 'none'}
                                </div>
                              )}
                            </>
                          )}
                          {isCard && (
                            <>
                              {after.layout && <div><strong>Layout:</strong> <code>{after.layout}</code></div>}
                              {after.content?.header && <div><strong>Header:</strong> {after.content.header}</div>}
                              {after.content?.paragraph && <div><strong>Paragraph:</strong> {after.content.paragraph}</div>}
                              {after.content?.symbol && <div><strong>Symbol:</strong> {after.content.symbol}</div>}
                              {after.content?.imageUrl && <div><strong>Image:</strong> {after.content.imageUrl}</div>}
                              {after.content?.colors && (
                                <div style={{ fontSize: '12px' }}>
                                  <strong>Colors:</strong> BG: {after.content.colors.backgroundColor || 'none'}, Text: {after.content.colors.textColor || 'none'}
                                </div>
                              )}
                            </>
                          )}
                          {isColor && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <div style={{ width: '20px', height: '20px', background: after.lightModeColor, borderRadius: '4px', border: '1px solid #ccc' }} />
                              <span>☀️ {after.lightModeColor}</span>
                              <div style={{ width: '20px', height: '20px', background: after.darkModeColor, borderRadius: '4px', border: '1px solid #ccc' }} />
                              <span>🌙 {after.darkModeColor}</span>
                            </div>
                          )}
                          {!isPage && !isSection && !isCard && !isColor && (
                            <div>{JSON.stringify(after)}</div>
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

      {/* DT-625 Sprint 8 - Preston Ball: Accessible custom confirmation and alert modal */}
      <CustomModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        onConfirm={modalState.onConfirm}
        onCancel={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

