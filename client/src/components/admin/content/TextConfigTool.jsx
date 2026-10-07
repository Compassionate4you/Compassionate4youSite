// DT-511 Sprint 7
// PBall
// Text configuration tool supporting Page -> Section -> Cards hierarchy and unique ID validation

import React, { useState, useMemo } from 'react'
import { PageStorageService } from '../../../services/pageStorageService'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { CardStorageService } from '../../../services/cardStorageService'
import { TextEntryService } from '../../../services/textEntryService'
import { AuditHistoryService } from '../../../services/auditHistoryService'

export default function TextConfigTool ({ onNotification }) {
  const pages = useMemo(() => PageStorageService.getPages(), [])
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id || 'landing')
  const unallocatedSections = useMemo(() => PageStorageService.getUnallocatedSections(), [])
  const unallocatedCards = useMemo(() => PageStorageService.getUnallocatedCards(), [])

  const selectedPage = PageStorageService.getPageById(selectedPageId)
  const allocatedSections = useMemo(() => {
    if (!selectedPage || !selectedPage.content?.sectionIds) return []
    return selectedPage.content.sectionIds.map(id => SectionStorageService.getSectionById(id)).filter(Boolean)
  }, [selectedPageId])

  const [selectedSectionId, setSelectedSectionId] = useState(allocatedSections[0]?.id || unallocatedSections[0]?.id || '')
  const selectedSection = SectionStorageService.getSectionById(selectedSectionId)

  const allocatedCards = useMemo(() => {
    if (!selectedSection || !selectedSection.content?.cardIds) return []
    return selectedSection.content.cardIds.map(id => CardStorageService.getCardById(id)).filter(Boolean)
  }, [selectedSectionId])

  const [selectedCardId, setSelectedCardId] = useState('')
  const [entryId, setEntryId] = useState(selectedSection?.id || '')
  const [englishText, setEnglishText] = useState(selectedSection?.content?.header || '')
  const [idError, setIdError] = useState('')

  const handleSaveText = (e) => {
    e.preventDefault()
    if (!TextEntryService.isTextEntryIdUnique(entryId, selectedSectionId)) {
      setIdError('Text Entry ID must be unique.')
      return
    }
    setIdError('')
    try {
      TextEntryService.saveTextEntry({ oldId: selectedSectionId, newId: entryId, translationJsonPath: entryId, englishText })
      AuditHistoryService.recordAppliedChange({ edits: { [entryId]: { before: selectedSection?.content?.header, after: englishText } } })
      onNotification(`Saved text entry "${entryId}"`)
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="content-editor-card">
      <h2>Text Configuration Tool</h2>
      <p className="content-editor-card-description">Navigate Page &rarr; Section &rarr; Cards hierarchy and edit copy.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Page</label>
          <select value={selectedPageId} onChange={(e) => setSelectedPageId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
            {pages.map(p => <option key={p.id} value={p.id}>{p.content?.title || p.id}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Section</label>
          <select value={selectedSectionId} onChange={(e) => { setSelectedSectionId(e.target.value); setEntryId(e.target.value); const s = SectionStorageService.getSectionById(e.target.value); setEnglishText(s?.content?.header || ''); }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
            <optgroup label="Allocated">{allocatedSections.map(s => <option key={s.id} value={s.id}>{s.id} ({s.layout})</option>)}</optgroup>
            {unallocatedSections.length > 0 && <optgroup label="Unallocated">{unallocatedSections.map(s => <option key={s.id} value={s.id}>[Unallocated] {s.id}</option>)}</optgroup>}
          </select>
        </div>
      </div>
      <form onSubmit={handleSaveText} style={{ marginTop: '20px', background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
        <h3>Edit Text Entry</h3>
        <div style={{ marginTop: '10px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Text Entry ID</label>
          <input type="text" value={entryId} onChange={(e) => setEntryId(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>English Text</label>
          <textarea rows={3} value={englishText} onChange={(e) => setEnglishText(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <button type="submit" style={{ marginTop: '12px', padding: '8px 16px', background: '#0f172a', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Save Text</button>
      </form>
    </div>
  )
}
