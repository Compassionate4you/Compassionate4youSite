// DT-510 Sprint 7
// PBall
// Color configuration management tool component supporting visual color wheel pickers, luminance filtering, and sorting

import React, { useState, useMemo } from 'react'
import { ColorConfigService, getLuminance } from '../../../services/colorConfigService'
import { AuditHistoryService } from '../../../services/auditHistoryService'

export default function ColorConfigTool ({ onNotification }) {
  const [colors, setColors] = useState(ColorConfigService.getColors())
  // DT-510 Sprint 7 - PBall: Start with blank creation fields (no prefilled defaults)
  const [newId, setNewId] = useState('')
  const [lightMode, setLightMode] = useState('')
  const [darkMode, setDarkMode] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editLight, setEditLight] = useState('')
  const [editDark, setEditDark] = useState('')

  // DT-510 Sprint 7 - PBall: Search, filter, and sorting state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMode, setFilterMode] = useState('all')
  const [sortBy, setSortBy] = useState('id-asc')

  const handleCreate = (e) => {
    e.preventDefault()
    const trimmedId = newId.trim()
    const trimmedLight = lightMode.trim()
    const trimmedDark = darkMode.trim()

    if (!trimmedId) {
      alert('Please enter a Color ID.')
      return
    }
    if (!trimmedLight || !trimmedDark) {
      alert('Please select or enter both Light Mode and Dark Mode colors.')
      return
    }

    try {
      const created = ColorConfigService.createColor({
        id: trimmedId,
        lightModeColor: trimmedLight,
        darkModeColor: trimmedDark
      })
      setColors(ColorConfigService.getColors())
      AuditHistoryService.recordAppliedChange({
        additions: [{ type: 'color', id: created.id, data: created }]
      })
      setNewId('')
      setLightMode('')
      setDarkMode('')
      onNotification(`Created color "${created.id}"`)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSaveEdit = (id) => {
    if (!editLight.trim() || !editDark.trim()) {
      alert('Light and Dark mode colors cannot be empty.')
      return
    }
    try {
      const oldColor = colors.find(c => c.id === id)
      const updated = ColorConfigService.updateColor(id, {
        lightModeColor: editLight.trim(),
        darkModeColor: editDark.trim()
      })
      setColors(ColorConfigService.getColors())
      AuditHistoryService.recordAppliedChange({
        edits: {
          [`color.${id}`]: { before: oldColor, after: updated }
        }
      })
      setEditingId(null)
      onNotification(`Updated color "${id}"`)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = (id) => {
    if (!window.confirm(`Delete color "${id}"?`)) return
    try {
      const removed = ColorConfigService.deleteColor(id)
      setColors(ColorConfigService.getColors())
      AuditHistoryService.recordAppliedChange({
        deletions: [{ type: 'color', id, data: removed }]
      })
      onNotification(`Deleted color "${id}"`)
    } catch (err) {
      alert(err.message)
    }
  }

  const displayedColors = useMemo(() => {
    let result = [...colors]
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(c => c.id.toLowerCase().includes(q))
    }
    if (filterMode === 'light-dominant') {
      result = result.filter(c => getLuminance(c.lightModeColor) > 0.5)
    } else if (filterMode === 'dark-dominant') {
      result = result.filter(c => getLuminance(c.lightModeColor) <= 0.5)
    }
    result.sort((a, b) => {
      if (sortBy === 'id-asc') return a.id.localeCompare(b.id)
      if (sortBy === 'id-desc') return b.id.localeCompare(a.id)
      if (sortBy === 'light-hex') return a.lightModeColor.localeCompare(b.lightModeColor)
      if (sortBy === 'dark-hex') return a.darkModeColor.localeCompare(b.darkModeColor)
      return 0
    })
    return result
  }, [colors, searchTerm, filterMode, sortBy])

  return (
    <div className="content-editor-card">
      <h2>Color Configuration Tool</h2>
      <p className="content-editor-card-description">
        Create, edit, and filter theme color tokens with interactive color wheels and dual light/dark modes.
      </p>

      {/* DT-510 Sprint 7 - PBall: Add Color Token Form with Visual Color Wheel */}
      <form onSubmit={handleCreate} style={{ marginTop: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 12px' }}>➕ Add New Color Token</h3>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
          Select Light and Dark mode values using the color wheel pickers or hex fields below.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
              Color Token ID
            </label>
            <input
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="e.g. color-emerald"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
              ☀️ Light Mode Color
            </label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="color"
                value={lightMode || '#ffffff'}
                onChange={(e) => setLightMode(e.target.value)}
                title="Choose light color wheel"
                style={{ width: '42px', height: '42px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}
              />
              <input
                type="text"
                value={lightMode}
                onChange={(e) => setLightMode(e.target.value)}
                placeholder="#ffffff"
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
              🌙 Dark Mode Color
            </label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="color"
                value={darkMode || '#000000'}
                onChange={(e) => setDarkMode(e.target.value)}
                title="Choose dark color wheel"
                style={{ width: '42px', height: '42px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}
              />
              <input
                type="text"
                value={darkMode}
                onChange={(e) => setDarkMode(e.target.value)}
                placeholder="#000000"
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              background: '#0f172a',
              color: '#fff',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Create Color Token
          </button>
        </div>
      </form>
      {/* DT-510 Sprint 7 - PBall: Filter, Sort, and Search Bar */}
      <div style={{ marginTop: '28px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 200px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search colors by ID..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginRight: '6px' }}>Filter:</span>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              >
                <option value="all">All Colors ({colors.length})</option>
                <option value="light-dominant">Light Dominant (&gt;50% luminance)</option>
                <option value="dark-dominant">Dark Dominant (&le;50% luminance)</option>
              </select>
            </div>

            <div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginRight: '6px' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              >
                <option value="id-asc">Name / ID (A-Z)</option>
                <option value="id-desc">Name / ID (Z-A)</option>
                <option value="light-hex">Light Hex</option>
                <option value="dark-hex">Dark Hex</option>
              </select>
            </div>
          </div>
        </div>
      </div>

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
                  <div style={{ flex: 1, textAlign: 'center' }}><div style={{ height: '24px', background: col.lightModeColor, borderRadius: '4px', border: '1px solid #ccc' }} /><small>☀️ Light Mode: {col.lightModeColor}</small></div>
                  <div style={{ flex: 1, textAlign: 'center' }}><div style={{ height: '24px', background: col.darkModeColor, borderRadius: '4px', border: '1px solid #ccc' }} /><small>🌙 Dark Mode: {col.darkModeColor}</small></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
