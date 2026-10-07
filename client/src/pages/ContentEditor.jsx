// DT-517 Sprint 7
// PBall
// Content Editor page incorporating tool switchers for Colors, Text, Sections, Cards, and Audit History

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ColorConfigTool from '../components/admin/content/ColorConfigTool'
import TextConfigTool from '../components/admin/content/TextConfigTool'
import SectionManager from '../components/admin/content/SectionManager'
import CardManager from '../components/admin/content/CardManager'
import AuditHistoryTool from '../components/admin/content/AuditHistoryTool'
import '../styles/contenteditor.css'

export default function ContentEditor () {
  const navigate = useNavigate()
  const [activeTool, setActiveTool] = useState('text')
  const [notification, setNotification] = useState('')

  const handleNotify = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 4000)
  }

  return (
    <div className="content-editor-page">
      <div className="content-editor-header-bar">
        <Link to="/admin" className="content-editor-back-link">
          &larr; Back to Dashboard
        </Link>
        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Admin User UUID: <code>a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d</code>
        </span>
      </div>

      <h1 className="content-editor-title">Content Editor Suite</h1>
      <p className="content-editor-subtitle">
        Manage site colors, cascading text hierarchy, section blocks, card elements, and applied audit history.
      </p>

      {notification && (
        <div className="content-editor-notification" style={{ marginTop: '16px', padding: '12px 16px', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontWeight: '600' }}>
          {notification}
        </div>
      )}

      {/* Tool Switcher Tabs */}
      <div className="content-editor-tabs" style={{ display: 'flex', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
        {[
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
            onClick={() => setActiveTool(tab.id)}
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
        {activeTool === 'text' && <TextConfigTool onNotification={handleNotify} />}
        {activeTool === 'colors' && <ColorConfigTool onNotification={handleNotify} />}
        {activeTool === 'sections' && <SectionManager onNotification={handleNotify} />}
        {activeTool === 'cards' && <CardManager onNotification={handleNotify} />}
        {activeTool === 'history' && <AuditHistoryTool onNotification={handleNotify} />}
      </div>
    </div>
  )
}