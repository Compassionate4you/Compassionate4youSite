// DT-512 Sprint 7
// PBall
// Section Manager component

import React, { useState } from 'react'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { ColorConfigService } from '../../../services/colorConfigService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import DynamicSectionRenderer from '../../modular/DynamicSectionRenderer'

export default function SectionManager ({ onNotification }) {
  const [sections, setSections] = useState(SectionStorageService.getSections())
  const colors = ColorConfigService.getColors()

  const [sectionId, setSectionId] = useState('')
  const [layout, setLayout] = useState('HEADER_TEXT')
  const [header, setHeader] = useState('')
  const [text, setText] = useState('')
  const [gridCols, setGridCols] = useState(3)
  const [themeMode, setThemeMode] = useState('light')

  const draftSection = {
    id: sectionId || 'preview',
    layout,
    colors: { backgroundColor: colors[0]?.id, headerColor: colors[1]?.id, textColor: colors[2]?.id },
    content: { header: header || 'Header Preview', text: text || 'Description...', gridCols: Number(gridCols), faqItems: [{ q: 'Q?', a: 'A.' }] }
  }

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
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="content-editor-card">
      <h2>Section Manager</h2>
      <p className="content-editor-card-description">Create section blocks with layouts and live preview.</p>
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
      <div style={{ marginTop: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4>Live Preview</h4>
          <button type="button" onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')} style={{ padding: '4px 8px', background: '#e2e8f0', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>{themeMode === 'light' ? '🌙 Dark' : '☀️ Light'}</button>
        </div>
        <DynamicSectionRenderer config={draftSection} theme={themeMode} />
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Sections ({sections.length})</h3>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px' }}>
          {sections.map(s => (
            <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '6px' }}>
              <span><strong>{s.id}</strong> ({s.layout})</span>
              <button type="button" onClick={() => handleDelete(s.id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>Del</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}