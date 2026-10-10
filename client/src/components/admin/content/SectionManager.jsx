// DT-512 Sprint 7
// PBall
// Section Manager component

import React, { useState } from 'react'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { PageStorageService } from '../../../services/pageStorageService'
import { ColorConfigService } from '../../../services/colorConfigService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import DynamicSectionRenderer from '../../modular/DynamicSectionRenderer'

export default function SectionManager ({ onNotification }) {
  const [sections, setSections] = useState(SectionStorageService.getSections())
  const colors = ColorConfigService.getColors()
  const pages = PageStorageService.getPages()
  
  const [mode, setMode] = useState('create')

  // Create Mode
  const [sectionId, setSectionId] = useState('')
  const [layout, setLayout] = useState('HEADER_TEXT')
  const [header, setHeader] = useState('')
  const [text, setText] = useState('')
  const [gridCols, setGridCols] = useState(3)
  const [themeMode, setThemeMode] = useState('light')

  // Manage Mode
  const [locationFilter, setLocationFilter] = useState('all')
  const [manageSectionId, setManageSectionId] = useState('')
  
  const [editLayout, setEditLayout] = useState('HEADER_TEXT')
  const [editHeader, setEditHeader] = useState('')
  const [editText, setEditText] = useState('')
  const [editGridCols, setEditGridCols] = useState(3)
  const [editBgColor, setEditBgColor] = useState('')
  const [editHeaderColor, setEditHeaderColor] = useState('')
  const [editTextColor, setEditTextColor] = useState('')
  const [editAccentColor, setEditAccentColor] = useState('')

  const handleCreate = (e) => {
    e.preventDefault()
    try {
      const created = SectionStorageService.createSection({ id: sectionId, layout, content: { header, text, gridCols: Number(gridCols) } })
      setSections(SectionStorageService.getSections())
      AuditHistoryService.recordAppliedChange({ additions: [{ type: 'section', id: created.id, data: created }] })
      setSectionId(''); setHeader(''); setText('')
      onNotification(`Created section "${created.id}"`)
    } catch (err) { alert(err.message) }
  }

  const handleDelete = (id) => {
    if (!window.confirm(`Delete section "${id}"?`)) return
    try {
      const removed = SectionStorageService.deleteSection(id)
      setSections(SectionStorageService.getSections())
      AuditHistoryService.recordAppliedChange({ deletions: [{ type: 'section', id, data: removed }] })
      onNotification(`Deleted section "${id}"`)
      if (manageSectionId === id) setManageSectionId('')
    } catch (err) { alert(err.message) }
  }

  const filteredSections = sections.filter(sec => {
    if (locationFilter === 'all') return true
    if (locationFilter === 'unallocated') {
      return !pages.some(p => p.content?.sectionIds?.includes(sec.id))
    }
    const page = pages.find(p => p.id === locationFilter)
    return page && page.content?.sectionIds?.includes(sec.id)
  })

  const handleSelectManage = (id) => {
    setManageSectionId(id)
    if (id) {
      const sec = SectionStorageService.getSectionById(id)
      setEditLayout(sec.layout || 'HEADER_TEXT')
      setEditHeader(sec.content?.header || '')
      setEditText(sec.content?.text || '')
      setEditGridCols(sec.content?.gridCols || 3)
      setEditBgColor(sec.colors?.backgroundColor || '')
      setEditHeaderColor(sec.colors?.headerColor || '')
      setEditTextColor(sec.colors?.textColor || '')
      setEditAccentColor(sec.colors?.accentColor || '')
    }
  }

  const handleSaveManage = (e) => {
    e.preventDefault()
    try {
      const oldSec = SectionStorageService.getSectionById(manageSectionId)
      const updated = SectionStorageService.updateSection(manageSectionId, {
        layout: editLayout,
        colors: { backgroundColor: editBgColor, headerColor: editHeaderColor, textColor: editTextColor, accentColor: editAccentColor },
        content: { ...oldSec.content, header: editHeader, text: editText, gridCols: Number(editGridCols) }
      })
      setSections(SectionStorageService.getSections())
      AuditHistoryService.recordAppliedChange({ edits: { [`section.${manageSectionId}`]: { before: oldSec, after: updated } } })
      onNotification(`Updated section "${manageSectionId}"`)
    } catch (err) { alert(err.message) }
  }

  const draftSection = mode === 'create' ? {
    id: sectionId || 'preview',
    layout,
    colors: { backgroundColor: colors[0]?.id, headerColor: colors[1]?.id, textColor: colors[2]?.id },
    content: { header: header || 'Header Preview', text: text || 'Description...', gridCols: Number(gridCols), faqItems: [{ q: 'Q?', a: 'A.' }] }
  } : {
    id: manageSectionId || 'preview',
    layout: editLayout,
    colors: { backgroundColor: editBgColor, headerColor: editHeaderColor, textColor: editTextColor, accentColor: editAccentColor },
    content: { header: editHeader, text: editText, gridCols: Number(editGridCols), faqItems: [{ q: 'Q?', a: 'A.' }] }
  }

  return (
    <div className="content-editor-card">
      <h2>Section Manager</h2>
      <p className="content-editor-card-description">Create section blocks with layouts and live preview.</p>

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button type="button" onClick={() => setMode('create')} style={{ flex: 1, padding: '10px', background: mode === 'create' ? '#0f172a' : '#e2e8f0', color: mode === 'create' ? '#fff' : '#000', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>➕ Create New Section</button>
        <button type="button" onClick={() => setMode('manage')} style={{ flex: 1, padding: '10px', background: mode === 'manage' ? '#0f172a' : '#e2e8f0', color: mode === 'manage' ? '#fff' : '#000', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>✏️ Manage Existing Sections</button>
      </div>

      {mode === 'create' && (
        <form onSubmit={handleCreate} style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
          <h3>Create Section</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <input type="text" value={sectionId} onChange={(e) => setSectionId(e.target.value)} placeholder="Section ID" required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <select value={layout} onChange={(e) => setLayout(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="HEADER_TEXT">HEADER_TEXT</option>
              <option value="IMAGE_HEADER_TEXT">IMAGE_HEADER_TEXT</option>
              <option value="FULLSCREEN_IMAGE_HEADER">FULLSCREEN_IMAGE_HEADER</option>
              <option value="CARD_GRID">CARD_GRID</option>
              <option value="FAQ_SECTION">FAQ_SECTION</option>
              <option value="MAP_SECTION">MAP_SECTION</option>
              <option value="CONTACT_SECTION">CONTACT_SECTION</option>
            </select>
          </div>
          <input type="text" value={header} onChange={(e) => setHeader(e.target.value)} placeholder="Header title" required style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Body text" style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
          {layout === 'CARD_GRID' && (
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Grid Columns (1-6)</label>
              <input type="number" min="1" max="6" value={gridCols} onChange={(e) => setGridCols(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              {Number(gridCols) > 3 && <div style={{ marginTop: '6px', padding: '8px', background: '#fef3c7', color: '#92400e', borderRadius: '6px', fontSize: '13px' }}>⚠️ Warning: Grid width &gt; 3 may appear glitchy.</div>}
            </div>
          )}
          <button type="submit" style={{ marginTop: '12px', padding: '8px 16px', background: '#0f172a', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Create</button>
        </form>
      )}

      {mode === 'manage' && (
        <form onSubmit={handleSaveManage} style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
          <h3>Manage Sections</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="all">All Locations</option>
              <option value="unallocated">Unallocated Sections</option>
              {pages.map(p => <option key={p.id} value={p.id}>Page: {p.id}</option>)}
            </select>
            <select value={manageSectionId} onChange={(e) => handleSelectManage(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="">Select a Section...</option>
              {filteredSections.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
            </select>
          </div>

          {manageSectionId && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <select value={editLayout} onChange={(e) => setEditLayout(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="HEADER_TEXT">HEADER_TEXT</option>
                  <option value="IMAGE_HEADER_TEXT">IMAGE_HEADER_TEXT</option>
                  <option value="FULLSCREEN_IMAGE_HEADER">FULLSCREEN_IMAGE_HEADER</option>
                  <option value="CARD_GRID">CARD_GRID</option>
                  <option value="FAQ_SECTION">FAQ_SECTION</option>
                  <option value="MAP_SECTION">MAP_SECTION</option>
                  <option value="CONTACT_SECTION">CONTACT_SECTION</option>
                </select>
                <input type="text" value={editHeader} onChange={(e) => setEditHeader(e.target.value)} placeholder="Header title" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <textarea rows={2} value={editText} onChange={(e) => setEditText(e.target.value)} placeholder="Body text" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                {editLayout === 'CARD_GRID' && (
                  <div>
                    <label style={{ fontWeight: 'bold' }}>Grid Columns (1-6)</label>
                    <input type="number" min="1" max="6" value={editGridCols} onChange={(e) => setEditGridCols(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                )}
              </div>

              <div style={{ marginTop: '16px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Applied Colors Config</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Background Color</label>
                    <select value={editBgColor} onChange={(e) => setEditBgColor(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Default</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Header Color</label>
                    <select value={editHeaderColor} onChange={(e) => setEditHeaderColor(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Default</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Text Color</label>
                    <select value={editTextColor} onChange={(e) => setEditTextColor(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Default</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Accent Color</label>
                    <select value={editAccentColor} onChange={(e) => setEditAccentColor(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Default</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '8px 16px', background: '#0f172a', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Save Changes</button>
                <button type="button" onClick={() => handleDelete(manageSectionId)} style={{ padding: '8px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          )}
        </form>
      )}

      {(mode === 'create' || manageSectionId) && (
        <div style={{ marginTop: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4>Live Preview</h4>
            <button type="button" onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')} style={{ padding: '4px 8px', background: '#e2e8f0', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>{themeMode === 'light' ? '🌙 Dark' : '☀️ Light'}</button>
          </div>
          <DynamicSectionRenderer config={draftSection} theme={themeMode} />
        </div>
      )}
    </div>
  )
}
