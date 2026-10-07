// DT-510 Sprint 7
// PBall
// Color configuration management tool component

import React, { useState } from 'react'
import { ColorConfigService } from '../../../services/colorConfigService'
import { AuditHistoryService } from '../../../services/auditHistoryService'

export default function ColorConfigTool ({ onNotification }) {
  const [colors, setColors] = useState(ColorConfigService.getColors())
  const [newId, setNewId] = useState('')
  const [lightMode, setLightMode] = useState('#262626')
  const [darkMode, setDarkMode] = useState('#ffffff')
  const [editingId, setEditingId] = useState(null)
  const [editLight, setEditLight] = useState('')
  const [editDark, setEditDark] = useState('')

  const handleCreate = (e) => {
    e.preventDefault()
    try {
      const created = ColorConfigService.createColor({ id: newId, lightModeColor: lightMode, darkModeColor: darkMode })
      setColors(ColorConfigService.getColors())
      AuditHistoryService.recordAppliedChange({ additions: [{ type: 'color', id: created.id, data: created }] })
      setNewId('')
      onNotification(`Created color "${created.id}"`)
    } catch (err) { alert(err.message) }
  }

  const handleSaveEdit = (id) => {
    try {
      const updated = ColorConfigService.updateColor(id, { lightModeColor: editLight, darkModeColor: editDark })
      setColors(ColorConfigService.getColors())
      AuditHistoryService.recordAppliedChange({ edits: { [`color.${id}`]: { before: colors.find(c => c.id === id), after: updated } } })
      setEditingId(null)
      onNotification(`Updated color "${id}"`)
    } catch (err) { alert(err.message) }
  }

  const handleDelete = (id) => {
    if (!window.confirm(`Delete color "${id}"?`)) return
    try {
      const removed = ColorConfigService.deleteColor(id)
      setColors(ColorConfigService.getColors())
      AuditHistoryService.recordAppliedChange({ deletions: [{ type: 'color', id, data: removed }] })
      onNotification(`Deleted color "${id}"`)
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="content-editor-card">
      <h2>Color Configuration Tool</h2>
      <p className="content-editor-card-description">Create, edit, and delete theme colors stored in database.</p>
      <form onSubmit={handleCreate} style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
        <h3>Add Color Token</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '8px' }}>
          <input type="text" value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="Color ID" required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <input type="text" value={lightMode} onChange={(e) => setLightMode(e.target.value)} placeholder="Light Hex" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <input type="text" value={darkMode} onChange={(e) => setDarkMode(e.target.value)} placeholder="Dark Hex" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <button type="submit" style={{ marginTop: '10px', padding: '8px 16px', background: '#0f172a', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Add</button>
      </form>
      <div style={{ marginTop: '20px' }}>
        <h3>Colors ({colors.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginTop: '10px' }}>
          {colors.map((col) => (
            <div key={col.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{col.id}</span>
                {editingId !== col.id && (
                  <div>
                    <button type="button" onClick={() => { setEditingId(col.id); setEditLight(col.lightModeColor); setEditDark(col.darkModeColor); }} style={{ marginRight: '4px', fontSize: '12px', padding: '2px 6px' }}>Edit</button>
                    <button type="button" onClick={() => handleDelete(col.id)} style={{ fontSize: '12px', padding: '2px 6px', background: '#fee2e2', color: '#991b1b', border: 'none' }}>Del</button>
                  </div>
                )}
              </div>
              {editingId === col.id ? (
                <div>
                  <input type="text" value={editLight} onChange={(e) => setEditLight(e.target.value)} style={{ width: '100%', marginBottom: '4px', padding: '4px' }} />
                  <input type="text" value={editDark} onChange={(e) => setEditDark(e.target.value)} style={{ width: '100%', marginBottom: '4px', padding: '4px' }} />
                  <button type="button" onClick={() => handleSaveEdit(col.id)} style={{ marginRight: '4px', padding: '4px 8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px' }}>Save</button>
                  <button type="button" onClick={() => setEditingId(null)} style={{ padding: '4px 8px', background: '#ccc', border: 'none', borderRadius: '4px' }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}><div style={{ height: '24px', background: col.lightModeColor, borderRadius: '4px', border: '1px solid #ccc' }} /><small>{col.lightModeColor}</small></div>
                  <div style={{ flex: 1, textAlign: 'center' }}><div style={{ height: '24px', background: col.darkModeColor, borderRadius: '4px', border: '1px solid #ccc' }} /><small>{col.darkModeColor}</small></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
