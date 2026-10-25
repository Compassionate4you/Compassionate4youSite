// DT-622 DT-618 Sprint 8
// Preston Ball
// Color configuration management tool component supporting visual color wheel pickers, expanded edit modal, general color search, and sort direction toggles

import React, { useState, useMemo } from 'react'
import { ColorConfigService, getGeneralColor } from '../../../services/colorConfigService'
import { AuditHistoryService } from '../../../services/auditHistoryService'

export default function ColorConfigTool ({ onNotification }) {
  const [colors, setColors] = useState(ColorConfigService.getColors())
  // DT-510 Sprint 7 - PBall: Start with blank creation fields (no prefilled defaults)
  const [newId, setNewId] = useState('')
  const [lightMode, setLightMode] = useState('')
  const [darkMode, setDarkMode] = useState('')

  // DT-622 Sprint 8 - Preston Ball: Expanded edit modal state
  const [editingColor, setEditingColor] = useState(null)
  const [editLight, setEditLight] = useState('')
  const [editDark, setEditDark] = useState('')

  // DT-622 Sprint 8 - Preston Ball: Search, general color filter, and sort state
  const [searchTerm, setSearchTerm] = useState('')
  const [generalColorFilter, setGeneralColorFilter] = useState('all')
  const [sortBy, setSortBy] = useState('id')
  const [sortDirection, setSortDirection] = useState('asc')

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

  const handleOpenEdit = (col) => {
    setEditingColor(col)
    setEditLight(col.lightModeColor)
    setEditDark(col.darkModeColor)
  }

  const handleCloseEdit = () => {
    setEditingColor(null)
    setEditLight('')
    setEditDark('')
  }

  const handleSaveEdit = (e) => {
    if (e) e.preventDefault()
    if (!editingColor) return
    const trimmedLight = editLight.trim()
    const trimmedDark = editDark.trim()

    if (!trimmedLight || !trimmedDark) {
      alert('Light and Dark mode colors cannot be empty.')
      return
    }

    try {
      const oldColor = colors.find(c => c.id === editingColor.id)
      const updated = ColorConfigService.updateColor(editingColor.id, {
        lightModeColor: trimmedLight,
        darkModeColor: trimmedDark
      })
      setColors(ColorConfigService.getColors())
      AuditHistoryService.recordAppliedChange({
        edits: {
          [`color.${editingColor.id}`]: { before: oldColor, after: updated }
        }
      })
      handleCloseEdit()
      onNotification(`Updated color "${editingColor.id}"`)
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
      if (editingColor?.id === id) {
        handleCloseEdit()
      }
    } catch (err) {
      alert(err.message)
    }
  }

  // DT-622 Sprint 8 - Preston Ball: Filter by ID or general color, sort by property and direction
  const displayedColors = useMemo(() => {
    let result = [...colors]
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(c => {
        const idMatch = c.id.toLowerCase().includes(q)
        const lightColorMatch = getGeneralColor(c.lightModeColor).toLowerCase().includes(q)
        const darkColorMatch = getGeneralColor(c.darkModeColor).toLowerCase().includes(q)
        return idMatch || lightColorMatch || darkColorMatch
      })
    }
    if (generalColorFilter !== 'all') {
      result = result.filter(c => {
        const lightFamily = getGeneralColor(c.lightModeColor)
        const darkFamily = getGeneralColor(c.darkModeColor)
        return lightFamily === generalColorFilter || darkFamily === generalColorFilter
      })
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'id') {
        cmp = a.id.localeCompare(b.id)
      } else if (sortBy === 'light') {
        cmp = a.lightModeColor.localeCompare(b.lightModeColor)
      } else if (sortBy === 'dark') {
        cmp = a.darkModeColor.localeCompare(b.darkModeColor)
      }
      return sortDirection === 'desc' ? -cmp : cmp
    })

    return result
  }, [colors, searchTerm, generalColorFilter, sortBy, sortDirection])

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

      {/* DT-622 Sprint 8 - Preston Ball: Expanded Edit Modal / Larger Menu */}
      {editingColor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                ✏️ Edit Color Token: <code style={{ color: '#0369a1' }}>{editingColor.id}</code>
              </h3>
              <button
                type="button"
                onClick={handleCloseEdit}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px' }}>
              Adjust color values using the dual color wheel pickers and hex inputs below.
            </p>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Light Mode Picker */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                    ☀️ Light Mode Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    <input
                      type="color"
                      value={editLight || '#ffffff'}
                      onChange={(e) => setEditLight(e.target.value)}
                      title="Light Mode Color Wheel"
                      style={{ width: '48px', height: '48px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={editLight}
                      onChange={(e) => setEditLight(e.target.value)}
                      placeholder="#ffffff"
                      required
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ height: '36px', background: editLight, borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: editLight }}>Preview</span>
                  </div>
                </div>

                {/* Dark Mode Picker */}
                <div style={{ background: '#0f172a', color: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                    🌙 Dark Mode Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    <input
                      type="color"
                      value={editDark || '#000000'}
                      onChange={(e) => setEditDark(e.target.value)}
                      title="Dark Mode Color Wheel"
                      style={{ width: '48px', height: '48px', padding: '2px', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={editDark}
                      onChange={(e) => setEditDark(e.target.value)}
                      placeholder="#000000"
                      required
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#1e293b', color: '#fff', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ height: '36px', background: editDark, borderRadius: '6px', border: '1px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: editDark }}>Preview</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DT-622 Sprint 8 - Preston Ball: Filter, General Color Search, and Sort with Direction Toggle */}
      <div style={{ marginTop: '28px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 240px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search colors by ID or general color (e.g. red, green)..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginRight: '6px' }}>Color Family:</span>
              <select
                value={generalColorFilter}
                onChange={(e) => setGeneralColorFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              >
                <option value="all">All Colors</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="red">Red</option>
                <option value="yellow">Yellow</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
                <option value="cyan">Cyan / Teal</option>
                <option value="gray">Gray</option>
                <option value="black">Black</option>
                <option value="white">White</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              >
                <option value="id">Name / ID</option>
                <option value="light">Light Hex</option>
                <option value="dark">Dark Hex</option>
              </select>

              <button
                type="button"
                onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                title="Toggle sort direction"
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {sortDirection === 'asc' ? '▲ Asc' : '▼ Desc'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DT-622 Sprint 8 - Preston Ball: Displayed Colors Grid mapping displayedColors */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>
            Color Tokens ({displayedColors.length} of {colors.length})
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {displayedColors.map((col) => (
            <div key={col.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '14px' }}>{col.id}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(col)}
                    style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(col.id)}
                    style={{ fontSize: '12px', padding: '4px 8px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Del
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: '32px', background: col.lightModeColor, borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '4px' }} />
                  <div style={{ fontSize: '11px', color: '#64748b' }}>☀️ Light</div>
                  <code style={{ fontSize: '11px' }}>{col.lightModeColor}</code>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: '32px', background: col.darkModeColor, borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '4px' }} />
                  <div style={{ fontSize: '11px', color: '#64748b' }}>🌙 Dark</div>
                  <code style={{ fontSize: '11px' }}>{col.darkModeColor}</code>
                </div>
              </div>
            </div>
          ))}
          {displayedColors.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '10px' }}>
              No colors found matching your filter/search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

