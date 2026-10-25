// DT-622 DT-625 Sprint 8
// Preston Ball
// Page Manager component allowing administrators to create, edit, rename, reorder pages and sections, delete pages, and preview content with custom modals and custom selects

import React, { useState, useEffect } from 'react'
import { PageStorageService } from '../../../services/pageStorageService'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import DynamicSectionRenderer from '../../modular/DynamicSectionRenderer'
import CustomModal from './CustomModal'
import CustomSelect from './CustomSelect'

export default function PageManager ({ onNotification, setIsDirty, registerSaveHandler }) {
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
  const [editPageId, setEditPageId] = useState(pages[0]?.id || '')
  const [editTitle, setEditTitle] = useState('')
  const [editSectionIds, setEditSectionIds] = useState([])
  const [manageSectionToAdd, setManageSectionToAdd] = useState('')

  // Custom Modal dialog state
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'Confirm',
    onConfirm: null
  })

  // Sync manage fields when managePageId changes
  useEffect(() => {
    if (managePageId) {
      const page = PageStorageService.getPageById(managePageId)
      if (page) {
        setEditPageId(page.id)
        setEditTitle(page.content?.title || page.id)
        setEditSectionIds(page.content?.sectionIds || [])
      }
    }
  }, [managePageId, pages])

  // Register save handler for unsaved changes leave interception
  useEffect(() => {
    if (registerSaveHandler) {
      registerSaveHandler(() => {
        if (mode === 'create') {
          return executeCreatePage()
        } else {
          return executeSaveManagePage()
        }
      })
    }
  }, [mode, newPageId, newPageTitle, newSectionIds, managePageId, editPageId, editTitle, editSectionIds])

  const markDirty = () => {
    if (setIsDirty) setIsDirty(true)
  }

  const markClean = () => {
    if (setIsDirty) setIsDirty(false)
  }

  // DT-625 Sprint 8 - Preston Ball: Prompt before creating a page
  const handleCreatePage = (e) => {
    e.preventDefault()
    setModalState({
      isOpen: true,
      title: 'Confirm Page Creation',
      message: `Are you sure you want to create page "${newPageTitle || newPageId}" with route "/${newPageId}"?`,
      type: 'confirm',
      confirmText: 'Create Page',
      onConfirm: () => {
        executeCreatePage()
        setModalState((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  const executeCreatePage = () => {
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
      markClean()
    } catch (err) {
      setModalState({
        isOpen: true,
        title: 'Error Creating Page',
        message: err.message,
        type: 'alert',
        confirmText: 'OK',
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
      })
    }
  }

  // DT-625 Sprint 8 - Preston Ball: Prompt before saving managed page changes
  const handleSaveManagePage = (e) => {
    e.preventDefault()
    if (!managePageId) return
    setModalState({
      isOpen: true,
      title: 'Confirm Save Changes',
      message: `Are you sure you want to save modifications to page "${editTitle || managePageId}"?`,
      type: 'confirm',
      confirmText: 'Save Changes',
      onConfirm: () => {
        executeSaveManagePage()
        setModalState((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  const executeSaveManagePage = () => {
    if (!managePageId) return
    try {
      const oldPage = PageStorageService.getPageById(managePageId)
      let activeId = managePageId

      // DT-625 Sprint 8 - Preston Ball: Handle page ID rename if modified
      if (editPageId && editPageId !== managePageId) {
        PageStorageService.renamePage(managePageId, editPageId)
        activeId = editPageId
      }

      const updated = PageStorageService.updatePage(activeId, {
        content: {
          ...oldPage.content,
          title: editTitle,
          sectionIds: editSectionIds
        }
      })
      const updatedPages = PageStorageService.getPages()
      setPages(updatedPages)
      setManagePageId(activeId)
      AuditHistoryService.recordAppliedChange({
        edits: {
          [`page.${activeId}`]: { before: oldPage, after: updated }
        }
      })
      onNotification(`Updated page "${activeId}" successfully.`)
      markClean()
    } catch (err) {
      setModalState({
        isOpen: true,
        title: 'Error Updating Page',
        message: err.message,
        type: 'alert',
        confirmText: 'OK',
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
      })
    }
  }

  // DT-625 Sprint 8 - Preston Ball: Custom modal for page deletion
  const handleDeletePage = (id) => {
    setModalState({
      isOpen: true,
      title: 'Delete Page',
      message: `Are you sure you want to permanently delete page "${id}"? This action cannot be undone.`,
      type: 'delete',
      confirmText: 'Delete Page',
      onConfirm: () => {
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
          markClean()
        } catch (err) {
          setModalState({
            isOpen: true,
            title: 'Error Deleting Page',
            message: err.message,
            type: 'alert',
            confirmText: 'OK',
            onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
          })
        }
        setModalState((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  // DT-625 Sprint 8 - Preston Ball: Reorder pages
  const handleMovePage = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= pages.length) return
    const updated = [...pages]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setPages(updated)
    PageStorageService.reorderPages(updated)
    onNotification('Updated site pages navigation order.')
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
    markDirty()
  }

  const removeSectionFromList = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index))
    markDirty()
  }

  // Active section IDs for preview
  const activePreviewSectionIds = mode === 'create' ? newSectionIds : editSectionIds
  const previewPageTitle = mode === 'create' ? (newPageTitle || newPageId || 'Page Preview') : (editTitle || managePageId)

  // Options for custom selects
  const pageOptions = pages.map((p) => ({
    value: p.id,
    label: `${p.content?.title || p.id} (/${p.id})`
  }))

  const sectionOptions = sections.map((s) => ({
    value: s.id,
    label: `${s.id} (${s.layout})`
  }))

  return (
    <div className="content-editor-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2>Page Manager</h2>
          <p className="content-editor-card-description">
            Create and configure site content pages, reorder navigation hierarchy, rename pages, and view live previews.
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => { setMode('create'); markClean() }}
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
            onClick={() => { setMode('manage'); markClean() }}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 440px) 1fr', gap: '24px', alignItems: 'start' }}>
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
                  onChange={(e) => {
                    setNewPageId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    markDirty()
                  }}
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
                  onChange={(e) => {
                    setNewPageTitle(e.target.value)
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Assign Sections
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <CustomSelect
                      value={selectedSectionToAdd}
                      onChange={(val) => setSelectedSectionToAdd(val)}
                      options={sectionOptions}
                      placeholder="-- Choose section to add --"
                      ariaLabel="Select section to add"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSectionToAdd && !newSectionIds.includes(selectedSectionToAdd)) {
                        setNewSectionIds([...newSectionIds, selectedSectionToAdd])
                        setSelectedSectionToAdd('')
                        markDirty()
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
                <CustomSelect
                  value={managePageId}
                  onChange={(val) => {
                    setManagePageId(val)
                    markClean()
                  }}
                  options={pageOptions}
                  ariaLabel="Select page to edit"
                />
              </div>

              {/* DT-625 Sprint 8 - Preston Ball: Allow renaming page ID */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Page Route / ID
                </label>
                <input
                  type="text"
                  required
                  value={editPageId}
                  onChange={(e) => {
                    setEditPageId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Route URL: /{editPageId}</span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Page Display Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value)
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Allocated Sections &amp; Order
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <CustomSelect
                      value={manageSectionToAdd}
                      onChange={(val) => setManageSectionToAdd(val)}
                      options={sectionOptions}
                      placeholder="-- Choose section to add --"
                      ariaLabel="Select section to add to page"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (manageSectionToAdd && !editSectionIds.includes(manageSectionToAdd)) {
                        setEditSectionIds([...editSectionIds, manageSectionToAdd])
                        setManageSectionToAdd('')
                        markDirty()
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

              {/* DT-625 Sprint 8 - Preston Ball: Reorder site pages section */}
              <div style={{ marginTop: '20px', padding: '14px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#0f172a' }}>Reorder Site Navigation Pages</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px' }}>Adjust order of pages as displayed in the website navigation bar:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {pages.map((p, idx) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                      <span><strong>{idx + 1}.</strong> {p.content?.title || p.id} (/{p.id})</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button type="button" title="Move Up" disabled={idx === 0} onClick={() => handleMovePage(idx, -1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
                        <button type="button" title="Move Down" disabled={idx === pages.length - 1} onClick={() => handleMovePage(idx, 1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === pages.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                      </div>
                    </div>
                  ))}
                </div>
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
              Live Preview: <em>{previewPageTitle}</em>
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setPreviewTheme('light')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: previewTheme === 'light' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                  background: previewTheme === 'light' ? '#0f172a' : '#ffffff',
                  color: previewTheme === 'light' ? '#ffffff' : '#0f172a'
                }}
              >
                ☀ Light
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme('dark')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: previewTheme === 'dark' ? '2px solid #38bdf8' : '1px solid #cbd5e1',
                  background: previewTheme === 'dark' ? '#38bdf8' : '#ffffff',
                  color: previewTheme === 'dark' ? '#0f172a' : '#0f172a'
                }}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          {/* Render Assigned Sections */}
          {activePreviewSectionIds.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>No sections assigned to this page.</p>
              <p style={{ fontSize: '0.85rem' }}>Add modular sections using the form on the left to see live content rendering.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

      {/* DT-625 Sprint 8 - Preston Ball: Reusable custom modal dialog for confirmations, alerts, and deletions */}
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
