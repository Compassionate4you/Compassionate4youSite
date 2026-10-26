// DT-622 DT-618 DT-625 Sprint 8
// Preston Ball
// Content Editor page incorporating tool switchers for Pages, Colors, Text, Sections, Cards, and Audit History with dirty-state save/leave confirmation prompts

import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageManager from '../components/admin/content/PageManager'
import ColorConfigTool from '../components/admin/content/ColorConfigTool'
import TextConfigTool from '../components/admin/content/TextConfigTool'
import SectionManager from '../components/admin/content/SectionManager'
import CardManager from '../components/admin/content/CardManager'
import AuditHistoryTool from '../components/admin/content/AuditHistoryTool'
import CustomModal from '../components/admin/content/CustomModal'
import '../styles/contenteditor.css'

export default function ContentEditor ({ embedded = false }) {
  const navigate = useNavigate()
  const [activeTool, setActiveTool] = useState('pages')
  const [notification, setNotification] = useState('')

  // DT-625 Sprint 8 - Preston Ball: Dirty state tracking and leave interception
  const [isDirty, setIsDirty] = useState(false)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)
  const activeSaveHandlerRef = useRef(null)

  const handleNotify = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 4000)
  }

  const registerSaveHandler = (fn) => {
    activeSaveHandlerRef.current = fn
  }

  // DT-625 Sprint 8 - Preston Ball: Intercept browser tab closing when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // DT-625 Sprint 8 - Preston Ball: Switch tool tabs safely
  const handleTabClick = (tabId) => {
    if (tabId === activeTool) return
    if (isDirty) {
      setPendingNavigation({ type: 'tab', target: tabId })
      setLeaveModalOpen(true)
    } else {
      setActiveTool(tabId)
    }
  }

  // DT-625 Sprint 8 - Preston Ball: Intercept back link to dashboard
  const handleBackToDashboard = (e) => {
    if (isDirty) {
      e.preventDefault()
      setPendingNavigation({ type: 'link', target: '/admin' })
      setLeaveModalOpen(true)
    }
  }

  // DT-625 Sprint 8 - Preston Ball: Confirm leave modal actions
  const handleConfirmSaveAndLeave = async () => {
    if (activeSaveHandlerRef.current) {
      try {
        await activeSaveHandlerRef.current()
      } catch (err) {
        console.error('Error saving before leaving:', err)
      }
    }
    setIsDirty(false)
    setLeaveModalOpen(false)
    executePendingNavigation()
  }

  const handleDiscardAndLeave = () => {
    setIsDirty(false)
    setLeaveModalOpen(false)
    executePendingNavigation()
  }

  const handleCancelLeave = () => {
    setLeaveModalOpen(false)
    setPendingNavigation(null)
  }

  const executePendingNavigation = () => {
    if (!pendingNavigation) return
    if (pendingNavigation.type === 'tab') {
      setActiveTool(pendingNavigation.target)
    } else if (pendingNavigation.type === 'link') {
      navigate(pendingNavigation.target)
    }
    setPendingNavigation(null)
  }

  const toolLabels = {
    pages: 'Page Manager',
    text: 'Text Config Tool',
    colors: 'Color Config Tool',
    sections: 'Section Manager',
    cards: 'Card Manager',
    history: 'Audit History'
  }

  return (
    <div className={`content-editor-page ${embedded ? 'content-editor-page--embedded' : ''}`}>
      {!embedded && (
        <div className="content-editor-header-bar">
          <Link
            to="/admin"
            className="content-editor-back-link"
            onClick={handleBackToDashboard}
          >
            &larr; Back to Dashboard
          </Link>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Admin User UUID: <code>a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d</code>
          </span>
        </div>
      )}

      <h1 className="content-editor-title">Content Editor Suite</h1>
      <p className="content-editor-subtitle">
        Manage site pages, theme colors, cascading text hierarchy, section blocks, card elements, and applied audit history.
      </p>

      {isDirty && (
        <div style={{ marginTop: '12px', padding: '8px 14px', background: '#fef3c7', color: '#92400e', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>●</span> Unsaved changes in {toolLabels[activeTool]}.
        </div>
      )}

      {notification && (
        <div className="content-editor-notification" style={{ marginTop: '16px', padding: '12px 16px', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontWeight: '600' }}>
          {notification}
        </div>
      )}

      {/* Tool Switcher Tabs */}
      <div className="content-editor-tabs" style={{ display: 'flex', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'pages', label: '📄 Page Manager' },
          { id: 'text', label: '📝 Text Config' },
          { id: 'colors', label: '🎨 Color Config' },
          { id: 'sections', label: '📐 Section Manager' },
          { id: 'cards', label: '🃏 Card Manager' },
          { id: 'history', label: '📜 Audit History' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`content-editor-tab ${activeTool === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '12px 16px',
              borderRadius: '10px',
              border: activeTool === tab.id ? '2px solid #0f172a' : '1px solid #cbd5e1',
              background: activeTool === tab.id ? '#0f172a' : '#ffffff',
              color: activeTool === tab.id ? '#ffffff' : '#0f172a',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tool Workspace */}
      <div className="content-editor-workspace" style={{ marginTop: '24px' }}>
        {activeTool === 'pages' && (
          <PageManager
            onNotification={handleNotify}
            setIsDirty={setIsDirty}
            registerSaveHandler={registerSaveHandler}
          />
        )}
        {activeTool === 'text' && (
          <TextConfigTool
            onNotification={handleNotify}
            setIsDirty={setIsDirty}
            registerSaveHandler={registerSaveHandler}
          />
        )}
        {activeTool === 'colors' && (
          <ColorConfigTool
            onNotification={handleNotify}
            setIsDirty={setIsDirty}
            registerSaveHandler={registerSaveHandler}
          />
        )}
        {activeTool === 'sections' && (
          <SectionManager
            onNotification={handleNotify}
            setIsDirty={setIsDirty}
            registerSaveHandler={registerSaveHandler}
          />
        )}
        {activeTool === 'cards' && (
          <CardManager
            onNotification={handleNotify}
            setIsDirty={setIsDirty}
            registerSaveHandler={registerSaveHandler}
          />
        )}
        {activeTool === 'history' && (
          <AuditHistoryTool
            onNotification={handleNotify}
            setIsDirty={setIsDirty}
          />
        )}
      </div>

      {/* DT-625 Sprint 8 - Preston Ball: Modal prompting save or discard on leave */}
      <CustomModal
        isOpen={leaveModalOpen}
        title="Unsaved Changes"
        type="save-discard"
        message={`You have unsaved changes in ${toolLabels[activeTool]}. Would you like to save your changes before leaving, discard them, or stay on this tool?`}
        confirmText="Save & Continue"
        discardText="Discard Changes"
        cancelText="Stay on Tool"
        onConfirm={handleConfirmSaveAndLeave}
        onDiscard={handleDiscardAndLeave}
        onCancel={handleCancelLeave}
      />
    </div>
  )
}
