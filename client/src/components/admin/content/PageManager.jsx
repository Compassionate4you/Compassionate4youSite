// DT-622 Sprint 8
// Preston Ball
// Page Manager component allowing administrators to create, edit, reorder sections, delete pages, and preview content

import React, { useState, useEffect } from 'react'
import { PageStorageService } from '../../../services/pageStorageService'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import DynamicSectionRenderer from '../../modular/DynamicSectionRenderer'

export default function PageManager ({ onNotification }) {
  const [pages, setPages] = useState(PageStorageService.getPages())
  const [sections, setSections] = useState(SectionStorageService.getSections())

  // Load from database on mount
  useEffect(() => {
    async function syncData () {
      const dbPages = await PageStorageService.loadFromDatabase()
      setPages(dbPages)
      const dbSections = await SectionStorageService.loadFromDatabase()
      setSections(dbSections)
    }
    syncData()
  }, [])

  const [mode, setMode] = useState('create') // 'create' | 'manage'
  const [previewTheme, setPreviewTheme] = useState('light')

  // Create Mode state
  const [newPageId, setNewPageId] = useState('')
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newSectionIds, setNewSectionIds] = useState([])
  const [selectedSectionToAdd, setSelectedSectionToAdd] = useState('')

  // Manage Mode state
  const [managePageId, setManagePageId] = useState(pages[0]?.id || '')
  const [editTitle, setEditTitle] = useState('')
  const [editSectionIds, setEditSectionIds] = useState([])
  const [manageSectionToAdd, setManageSectionToAdd] = useState('')

  // Sync manage fields when managePageId changes
  useEffect(() => {
    if (managePageId) {
      const page = PageStorageService.getPageById(managePageId)
      if (page) {
        setEditTitle(page.content?.title || page.id)
        setEditSectionIds(page.content?.sectionIds || [])
      }
    }
  }, [managePageId, pages])

  // DT-622 Sprint 8 - Preston Ball: Create page handler
  const handleCreatePage = (e) => {
    e.preventDefault()
    try {
      const created = PageStorageService.createPage({
        id: newPageId,
        content: {
          title: newPageTitle || newPageId,
          sectionIds: newSectionIds
        }
      })
      const updatedPages = PageStorageService.getPages()
      setPages(updatedPages)
      AuditHistoryService.recordAppliedChange({
        additions: [{ type: 'page', id: created.id, data: created }]
      })
      onNotification(`Created page "${created.id}" successfully.`)
      setNewPageId('')
      setNewPageTitle('')
      setNewSectionIds([])
      setSelectedSectionToAdd('')
    } catch (err) {
      alert(err.message)
    }
  }

  // DT-622 Sprint 8 - Preston Ball: Save managed page changes
  const handleSaveManagePage = (e) => {
    e.preventDefault()
    if (!managePageId) return
    try {
      const oldPage = PageStorageService.getPageById(managePageId)
      const updated = PageStorageService.updatePage(managePageId, {
        content: {
          ...oldPage.content,
          title: editTitle,
          sectionIds: editSectionIds
        }
      })
      const updatedPages = PageStorageService.getPages()
      setPages(updatedPages)
      AuditHistoryService.recordAppliedChange({
        edits: {
          [`page.${managePageId}`]: { before: oldPage, after: updated }
        }
      })
      onNotification(`Updated page "${managePageId}" successfully.`)
    } catch (err) {
      alert(err.message)
    }
  }

  // DT-622 Sprint 8 - Preston Ball: Delete page handler
  const handleDeletePage = (id) => {
    if (!window.confirm(`Are you sure you want to delete page "${id}"?`)) return
    try {
      const removed = PageStorageService.deletePage(id)
      const updatedPages = PageStorageService.getPages()
      setPages(updatedPages)
      AuditHistoryService.recordAppliedChange({
        deletions: [{ type: 'page', id, data: removed }]
      })
      onNotification(`Deleted page "${id}".`)
      if (managePageId === id) {
        setManagePageId(updatedPages[0]?.id || '')
      }
    } catch (err) {
      alert(err.message)
    }
  }

  // Helper to reorder sections
  const moveSection = (list, setList, index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= list.length) return
    const updated = [...list]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setList(updated)
  }

  const removeSectionFromList = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index))
  }

  // Active section IDs for preview
  const activePreviewSectionIds = mode === 'create' ? newSectionIds : editSectionIds
  const previewPageTitle = mode === 'create' ? (newPageTitle || newPageId || 'Page Preview') : (editTitle || managePageId)

  return (
    <div className="content-editor-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2>Page Manager</h2>
          <p className="content-editor-card-description">
            Create and configure site content pages, organize modular section hierarchies, and view live previews.
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setMode('create')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              border: mode === 'create' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              background: mode === 'create' ? '#0f172a' : '#ffffff',
              color: mode === 'create' ? '#ffffff' : '#0f172a'
            }}
          >
            + Create New Page
          </button>
          <button
            type="button"
            onClick={() => setMode('manage')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              border: mode === 'manage' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              background: mode === 'manage' ? '#0f172a' : '#ffffff',
              color: mode === 'manage' ? '#ffffff' : '#0f172a'
            }}
          >
            ⚙ Manage Existing Pages ({pages.length})
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Form Controls */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          {mode === 'create' ? (
            <form onSubmit={handleCreatePage}>
              <h3 style={{ marginBottom: '14px', fontSize: '1.1rem' }}>Create Content Page</h3>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Page Route / ID (e.g. "wellness", "careers")
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. wellness"
                  value={newPageId}
                  onChange={(e) => setNewPageId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Route URL: /{newPageId || '<page-id>'}</span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Page Display Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wellness & Lifestyle Programs"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Assign Sections
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <select
                    value={selectedSectionToAdd}
                    onChange={(e) => setSelectedSectionToAdd(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- Choose section to add --</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} ({s.layout})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSectionToAdd && !newSectionIds.includes(selectedSectionToAdd)) {
                        setNewSectionIds([...newSectionIds, selectedSectionToAdd])
                        setSelectedSectionToAdd('')
                      }
                    }}
                    style={{ padding: '8px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    + Add
                  </button>
                </div>

                {/* Allocated Sections List */}
                {newSectionIds.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No sections added to this page yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {newSectionIds.map((secId, idx) => (
                      <div key={secId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '0.85rem' }}>
                        <span><strong>{idx + 1}.</strong> {secId}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" onClick={() => moveSection(newSectionIds, setNewSectionIds, idx, -1)} disabled={idx === 0} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
                          <button type="button" onClick={() => moveSection(newSectionIds, setNewSectionIds, idx, 1)} disabled={idx === newSectionIds.length - 1} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === newSectionIds.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                          <button type="button" onClick={() => removeSectionFromList(newSectionIds, setNewSectionIds, idx)} style={{ padding: '2px 6px', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '10px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
              >
                Create Page
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaveManagePage}>
              <h3 style={{ marginBottom: '14px', fontSize: '1.1rem' }}>Manage Existing Page</h3>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Select Page to Edit
                </label>
                <select
                  value={managePageId}
                  onChange={(e) => setManagePageId(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.content?.title || p.id} (/{p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Page Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Allocated Sections &amp; Order
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <select
                    value={manageSectionToAdd}
                    onChange={(e) => setManageSectionToAdd(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- Choose section to add --</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} ({s.layout})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (manageSectionToAdd && !editSectionIds.includes(manageSectionToAdd)) {
                        setEditSectionIds([...editSectionIds, manageSectionToAdd])
                        setManageSectionToAdd('')
                      }
                    }}
                    style={{ padding: '8px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    + Add
                  </button>
                </div>

                {editSectionIds.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No sections assigned to this page.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {editSectionIds.map((secId, idx) => (
                      <div key={secId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '0.85rem' }}>
                        <span><strong>{idx + 1}.</strong> {secId}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" onClick={() => moveSection(editSectionIds, setEditSectionIds, idx, -1)} disabled={idx === 0} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
                          <button type="button" onClick={() => moveSection(editSectionIds, setEditSectionIds, idx, 1)} disabled={idx === editSectionIds.length - 1} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === editSectionIds.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                          <button type="button" onClick={() => removeSectionFromList(editSectionIds, setEditSectionIds, idx)} style={{ padding: '2px 6px', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePage(managePageId)}
                  style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Live Preview Canvas */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: previewTheme === 'dark' ? '#0f172a' : '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: previewTheme === 'dark' ? '#f8fafc' : '#0f172a' }}>
              Live Page Preview: {previewPageTitle}
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setPreviewTheme('light')}
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', background: previewTheme === 'light' ? '#0284c7' : '#e2e8f0', color: previewTheme === 'light' ? '#fff' : '#000', border: 'none' }}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme('dark')}
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', background: previewTheme === 'dark' ? '#0284c7' : '#e2e8f0', color: previewTheme === 'dark' ? '#fff' : '#000', border: 'none' }}
              >
                Dark
              </button>
            </div>
          </div>

          {activePreviewSectionIds.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <p>No sections currently allocated to this page.</p>
              <p style={{ fontSize: '0.85rem' }}>Select sections on the left to render the page preview.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activePreviewSectionIds.map((secId) => {
                const sec = SectionStorageService.getSectionById(secId)
                if (!sec) {
                  return (
                    <div key={secId} style={{ padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                      [Section "{secId}" not found in storage]
                    </div>
                  )
                }
                return (
                  <DynamicSectionRenderer
                    key={secId}
                    config={sec}
                    theme={previewTheme}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
