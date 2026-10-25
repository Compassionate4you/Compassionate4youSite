// DT-622 DT-618 Sprint 8
// Preston Ball
// Section Manager component supporting layout-specific dynamic fields, content/color tabs, and live preview

import React, { useState } from 'react'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { PageStorageService } from '../../../services/pageStorageService'
import { CardStorageService } from '../../../services/cardStorageService'
import { ColorConfigService } from '../../../services/colorConfigService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import DynamicSectionRenderer from '../../modular/DynamicSectionRenderer'

export default function SectionManager ({ onNotification }) {
  const [sections, setSections] = useState(SectionStorageService.getSections())
  const colors = ColorConfigService.getColors()
  const pages = PageStorageService.getPages()
  const allCards = CardStorageService.getCards()

  const [mode, setMode] = useState('create')
  const [activeTab, setActiveTab] = useState('content') // 'content' | 'colors'
  const [themeMode, setThemeMode] = useState('light')

  // Create Mode state
  const [sectionId, setSectionId] = useState('')
  const [layout, setLayout] = useState('HEADER_TEXT')
  const [header, setHeader] = useState('')
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [buttonLink, setButtonLink] = useState('')
  const [icon, setIcon] = useState('')
  const [mapAddress, setMapAddress] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [directionsUrl, setDirectionsUrl] = useState('')
  const [gridCols, setGridCols] = useState(3)
  const [selectedCardIds, setSelectedCardIds] = useState([])
  const [faqItems, setFaqItems] = useState([{ question: '', answer: '' }])
  const [benefitItems, setBenefitItems] = useState([{ heading: '', description: '' }])
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [fax, setFax] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [bgColor, setBgColor] = useState('')
  const [headerColor, setHeaderColor] = useState('')
  const [textColor, setTextColor] = useState('')
  const [accentColor, setAccentColor] = useState('')

  // Manage Mode state
  const [locationFilter, setLocationFilter] = useState('all')
  const [manageSectionId, setManageSectionId] = useState('')
  const [editLayout, setEditLayout] = useState('HEADER_TEXT')
  const [editHeader, setEditHeader] = useState('')
  const [editText, setEditText] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editImageAlt, setEditImageAlt] = useState('')
  const [editButtonText, setEditButtonText] = useState('')
  const [editButtonLink, setEditButtonLink] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editMapAddress, setEditMapAddress] = useState('')
  const [editEmbedUrl, setEditEmbedUrl] = useState('')
  const [editDirectionsUrl, setEditDirectionsUrl] = useState('')
  const [editGridCols, setEditGridCols] = useState(3)
  const [editSelectedCardIds, setEditSelectedCardIds] = useState([])
  const [editFaqItems, setEditFaqItems] = useState([])
  const [editBenefitItems, setEditBenefitItems] = useState([])
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editFax, setEditFax] = useState('')
  const [editAddressLine1, setEditAddressLine1] = useState('')
  const [editAddressLine2, setEditAddressLine2] = useState('')
  const [editBgColor, setEditBgColor] = useState('')
  const [editHeaderColor, setEditHeaderColor] = useState('')
  const [editTextColor, setEditTextColor] = useState('')
  const [editAccentColor, setEditAccentColor] = useState('')

  const handleSelectManage = (id) => {
    setManageSectionId(id)
    if (id) {
      const sec = SectionStorageService.getSectionById(id)
      const c = sec.content || {}
      const col = c.colors || sec.colors || {}
      setEditLayout(sec.layout || 'HEADER_TEXT')
      setEditHeader(c.header || c.title || '')
      setEditText(c.text || c.paragraph || c.subtitle || '')
      setEditImageUrl(c.imageUrl || '')
      setEditImageAlt(c.imageAlt || '')
      setEditButtonText(c.buttonText || '')
      setEditButtonLink(c.buttonLink || '')
      setEditIcon(c.icon || '')
      setEditMapAddress(c.mapAddress || '')
      setEditEmbedUrl(c.embedUrl || '')
      setEditDirectionsUrl(c.directionsUrl || '')
      setEditGridCols(Number(c.gridCols || c.columns || 3))
      setEditSelectedCardIds(Array.isArray(c.cardIds) ? c.cardIds : [])
      setEditFaqItems(Array.isArray(c.faqItems) ? c.faqItems : [{ question: '', answer: '' }])
      setEditBenefitItems(Array.isArray(c.items) ? c.items : [{ heading: '', description: '' }])
      setEditPhone(c.phone || '')
      setEditEmail(c.email || '')
      setEditFax(c.fax || '')
      setEditAddressLine1(c.addressLine1 || '')
      setEditAddressLine2(c.addressLine2 || '')
      setEditBgColor(col.backgroundColor || '')
      setEditHeaderColor(col.headerColor || '')
      setEditTextColor(col.textColor || '')
      setEditAccentColor(col.accentColor || '')
    }
  }

  const handleCreate = (e) => {
    e.preventDefault()
    const trimmedId = sectionId.trim()
    if (!trimmedId) {
      alert('Please enter a Section ID.')
      return
    }

    try {
      const sectionContent = {
        header,
        text,
        imageUrl,
        imageAlt,
        buttonText,
        buttonLink,
        icon,
        mapAddress,
        embedUrl,
        directionsUrl,
        gridCols: Number(gridCols),
        cardIds: selectedCardIds,
        faqItems: faqItems.filter(f => f.question || f.answer),
        items: benefitItems.filter(b => b.heading || b.description),
        phone,
        email,
        fax,
        addressLine1,
        addressLine2,
        colors: {
          backgroundColor: bgColor,
          headerColor,
          textColor,
          accentColor
        }
      }

      const created = SectionStorageService.createSection({
        id: trimmedId,
        layout,
        content: sectionContent
      })
      setSections(SectionStorageService.getSections())
      AuditHistoryService.recordAppliedChange({
        additions: [{ type: 'section', id: created.id, data: created }]
      })
      setSectionId('')
      setHeader('')
      setText('')
      onNotification(`Created section "${created.id}"`)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSaveManage = (e) => {
    e.preventDefault()
    if (!manageSectionId) return
    try {
      const oldSec = SectionStorageService.getSectionById(manageSectionId)
      const updatedContent = {
        ...oldSec.content,
        header: editHeader,
        text: editText,
        imageUrl: editImageUrl,
        imageAlt: editImageAlt,
        buttonText: editButtonText,
        buttonLink: editButtonLink,
        icon: editIcon,
        mapAddress: editMapAddress,
        embedUrl: editEmbedUrl,
        directionsUrl: editDirectionsUrl,
        gridCols: Number(editGridCols),
        cardIds: editSelectedCardIds,
        faqItems: editFaqItems.filter(f => f.question || f.answer),
        items: editBenefitItems.filter(b => b.heading || b.description),
        phone: editPhone,
        email: editEmail,
        fax: editFax,
        addressLine1: editAddressLine1,
        addressLine2: editAddressLine2,
        colors: {
          backgroundColor: editBgColor,
          headerColor: editHeaderColor,
          textColor: editTextColor,
          accentColor: editAccentColor
        }
      }

      const updated = SectionStorageService.updateSection(manageSectionId, {
        layout: editLayout,
        content: updatedContent
      })
      setSections(SectionStorageService.getSections())
      AuditHistoryService.recordAppliedChange({
        edits: { [`section.${manageSectionId}`]: { before: oldSec, after: updated } }
      })
      onNotification(`Updated section "${manageSectionId}"`)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = (id) => {
    if (!window.confirm(`Delete section "${id}"?`)) return
    try {
      const removed = SectionStorageService.deleteSection(id)
      setSections(SectionStorageService.getSections())
      AuditHistoryService.recordAppliedChange({
        deletions: [{ type: 'section', id, data: removed }]
      })
      onNotification(`Deleted section "${id}"`)
      if (manageSectionId === id) setManageSectionId('')
    } catch (err) {
      alert(err.message)
    }
  }

  const filteredSections = sections.filter(sec => {
    if (locationFilter === 'all') return true
    if (locationFilter === 'unallocated') {
      return !pages.some(p => p.content?.sectionIds?.includes(sec.id))
    }
    const page = pages.find(p => p.id === locationFilter)
    return page && page.content?.sectionIds?.includes(sec.id)
  })

  // Live draft representation for preview
  const activeLayout = mode === 'create' ? layout : editLayout
  const activeData = mode === 'create' ? {
    header: header || 'Section Header Preview',
    text: text || 'Section description text goes here...',
    imageUrl: imageUrl || '/assets/images/CareImage1.jpeg',
    imageAlt: imageAlt || 'Preview Image',
    buttonText: buttonText || 'Learn More',
    buttonLink: buttonLink || '#',
    icon,
    mapAddress: mapAddress || '1501 N Broadway, Ste 350A/B, Walnut Creek, CA',
    embedUrl,
    directionsUrl,
    gridCols,
    cardIds: selectedCardIds,
    faqItems,
    items: benefitItems,
    phone,
    email,
    fax,
    addressLine1,
    addressLine2,
    colors: { backgroundColor: bgColor, headerColor, textColor, accentColor }
  } : {
    header: editHeader || 'Section Header',
    text: editText || 'Section text',
    imageUrl: editImageUrl,
    imageAlt: editImageAlt,
    buttonText: editButtonText,
    buttonLink: editButtonLink,
    icon: editIcon,
    mapAddress: editMapAddress,
    embedUrl: editEmbedUrl,
    directionsUrl: editDirectionsUrl,
    gridCols: editGridCols,
    cardIds: editSelectedCardIds,
    faqItems: editFaqItems,
    items: editBenefitItems,
    phone: editPhone,
    email: editEmail,
    fax: editFax,
    addressLine1: editAddressLine1,
    addressLine2: editAddressLine2,
    colors: { backgroundColor: editBgColor, headerColor: editHeaderColor, textColor: editTextColor, accentColor: editAccentColor }
  }

  const draftSection = {
    id: (mode === 'create' ? sectionId : manageSectionId) || 'draft-preview',
    layout: activeLayout,
    content: activeData
  }

  return (
    <div className="content-editor-card">
      <h2>Section Manager</h2>
      <p className="content-editor-card-description">
        Configure modular sections with layout-specific fields, theme color variables, and live dynamic preview.
      </p>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => setMode('create')}
          style={{
            flex: 1,
            padding: '12px',
            background: mode === 'create' ? '#0f172a' : '#e2e8f0',
            color: mode === 'create' ? '#fff' : '#0f172a',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ➕ Create New Section
        </button>
        <button
          type="button"
          onClick={() => setMode('manage')}
          style={{
            flex: 1,
            padding: '12px',
            background: mode === 'manage' ? '#0f172a' : '#e2e8f0',
            color: mode === 'manage' ? '#fff' : '#0f172a',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ✏️ Manage Existing Sections
        </button>
      </div>

      {/* Subtab Toggle: Content vs Colors */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'content' ? '#0f172a' : 'transparent',
            color: activeTab === 'content' ? '#ffffff' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📝 Content & Text
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'colors' ? '#0f172a' : 'transparent',
            color: activeTab === 'colors' ? '#ffffff' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🎨 Colors & Theme
        </button>
      </div>

      {/* CREATE MODE */}
      {mode === 'create' && (
        <form onSubmit={handleCreate} style={{ marginTop: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Section ID</label>
              <input
                type="text"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                placeholder="e.g. sec-home-services"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Section Layout</label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="HEADER_TEXT">HEADER_TEXT (Editorial title and text)</option>
                <option value="IMAGE_HEADER_TEXT">IMAGE_HEADER_TEXT (Hero image, title, text, CTA)</option>
                <option value="FULLSCREEN_IMAGE_HEADER">FULLSCREEN_IMAGE_HEADER (Banner overlay with CTA)</option>
                <option value="CARD_GRID">CARD_GRID (Responsive card columns)</option>
                <option value="MAP_SECTION">MAP_SECTION (Google Maps embed & directions)</option>
                <option value="ACCOUNT_BENEFITS">ACCOUNT_BENEFITS (Checklist items)</option>
                <option value="CONTACT_FORM">CONTACT_FORM (Contact details & form)</option>
                <option value="FAQ_SECTION">FAQ_SECTION (Accordion Q&A items)</option>
              </select>
            </div>
          </div>

          {activeTab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Title / Header</label>
                <input
                  type="text"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  placeholder="Primary section header"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {['HEADER_TEXT', 'IMAGE_HEADER_TEXT', 'FULLSCREEN_IMAGE_HEADER'].includes(layout) && (
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Body Text / Description</label>
                  <textarea
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter section description..."
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              )}

              {['IMAGE_HEADER_TEXT', 'FULLSCREEN_IMAGE_HEADER'].includes(layout) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image URL</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="/assets/images/CareImage1.jpeg"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image Alt Text</label>
                    <input
                      type="text"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Descriptive image text"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Button Text</label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g. Schedule Consultation"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Button Link</label>
                    <input
                      type="text"
                      value={buttonLink}
                      onChange={(e) => setButtonLink(e.target.value)}
                      placeholder="/schedule"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              )}

              {layout === 'MAP_SECTION' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Office Address Text</label>
                    <input
                      type="text"
                      value={mapAddress}
                      onChange={(e) => setMapAddress(e.target.value)}
                      placeholder="1501 N Broadway, Ste 350A/B, Walnut Creek, CA"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Google Maps Embed URL</label>
                    <input
                      type="text"
                      value={embedUrl}
                      onChange={(e) => setEmbedUrl(e.target.value)}
                      placeholder="https://www.google.com/maps/embed?..."
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Directions URL</label>
                    <input
                      type="text"
                      value={directionsUrl}
                      onChange={(e) => setDirectionsUrl(e.target.value)}
                      placeholder="https://www.google.com/maps/dir/?..."
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              )}

              {layout === 'CARD_GRID' && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Grid Columns (1-4)</label>
                    <select
                      value={gridCols}
                      onChange={(e) => setGridCols(e.target.value)}
                      style={{ width: '120px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="1">1 Column</option>
                      <option value="2">2 Columns</option>
                      <option value="3">3 Columns</option>
                      <option value="4">4 Columns</option>
                    </select>
                  </div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>Select Cards to Include</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                    {allCards.map((c) => {
                      const isChecked = selectedCardIds.includes(c.id)
                      return (
                        <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedCardIds([...selectedCardIds, c.id])
                              else setSelectedCardIds(selectedCardIds.filter(id => id !== c.id))
                            }}
                          />
                          <span><code>{c.id}</code> ({c.layout})</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {layout === 'FAQ_SECTION' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontWeight: '600', fontSize: '13px' }}>FAQ Items ({faqItems.length})</label>
                    <button
                      type="button"
                      onClick={() => setFaqItems([...faqItems, { question: '', answer: '' }])}
                      style={{ padding: '4px 10px', fontSize: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      + Add Question
                    </button>
                  </div>
                  {faqItems.map((item, idx) => (
                    <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => {
                          const next = [...faqItems]
                          next[idx].question = e.target.value
                          setFaqItems(next)
                        }}
                        placeholder="Question"
                        style={{ width: '100%', marginBottom: '6px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                      <textarea
                        rows={2}
                        value={item.answer}
                        onChange={(e) => {
                          const next = [...faqItems]
                          next[idx].answer = e.target.value
                          setFaqItems(next)
                        }}
                        placeholder="Answer"
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {layout === 'ACCOUNT_BENEFITS' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontWeight: '600', fontSize: '13px' }}>Benefit Items ({benefitItems.length})</label>
                    <button
                      type="button"
                      onClick={() => setBenefitItems([...benefitItems, { heading: '', description: '' }])}
                      style={{ padding: '4px 10px', fontSize: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      + Add Benefit
                    </button>
                  </div>
                  {benefitItems.map((item, idx) => (
                    <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={item.heading}
                        onChange={(e) => {
                          const next = [...benefitItems]
                          next[idx].heading = e.target.value
                          setBenefitItems(next)
                        }}
                        placeholder="Benefit heading"
                        style={{ width: '100%', marginBottom: '6px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => {
                          const next = [...benefitItems]
                          next[idx].description = e.target.value
                          setBenefitItems(next)
                        }}
                        placeholder="Benefit description"
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {layout === 'CONTACT_FORM' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <input type="text" value={fax} onChange={(e) => setFax(e.target.value)} placeholder="Fax" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Address line 1" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'colors' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Background Color</label>
                <select value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Default Theme</option>
                  {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Header Color</label>
                <select value={headerColor} onChange={(e) => setHeaderColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Default Theme</option>
                  {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Text Color</label>
                <select value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Default Theme</option>
                  {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Accent Color</label>
                <select value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Default Theme</option>
                  {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
              </div>
            </div>
          )}

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
            >
              Create Section
            </button>
          </div>
        </form>
      )}

      {/* MANAGE MODE */}
      {mode === 'manage' && (
        <form onSubmit={handleSaveManage} style={{ marginTop: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Filter by Location</label>
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="all">All Locations</option>
                <option value="unallocated">Unallocated Sections</option>
                {pages.map(p => <option key={p.id} value={p.id}>Page: {p.id}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Select Section to Edit</label>
              <select value={manageSectionId} onChange={(e) => handleSelectManage(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="">Select a Section...</option>
                {filteredSections.map(s => <option key={s.id} value={s.id}>{s.id} ({s.layout})</option>)}
              </select>
            </div>
          </div>

          {manageSectionId && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 'bold' }}>Editing: <code>{manageSectionId}</code></span>
                <button
                  type="button"
                  onClick={() => handleDelete(manageSectionId)}
                  style={{ padding: '4px 10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Delete Section
                </button>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Section Layout</label>
                <select
                  value={editLayout}
                  onChange={(e) => setEditLayout(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="HEADER_TEXT">HEADER_TEXT</option>
                  <option value="IMAGE_HEADER_TEXT">IMAGE_HEADER_TEXT</option>
                  <option value="FULLSCREEN_IMAGE_HEADER">FULLSCREEN_IMAGE_HEADER</option>
                  <option value="CARD_GRID">CARD_GRID</option>
                  <option value="MAP_SECTION">MAP_SECTION</option>
                  <option value="ACCOUNT_BENEFITS">ACCOUNT_BENEFITS</option>
                  <option value="CONTACT_FORM">CONTACT_FORM</option>
                  <option value="FAQ_SECTION">FAQ_SECTION</option>
                </select>
              </div>

              {activeTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Title / Header</label>
                    <input
                      type="text"
                      value={editHeader}
                      onChange={(e) => setEditHeader(e.target.value)}
                      placeholder="Primary section header"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {['HEADER_TEXT', 'IMAGE_HEADER_TEXT', 'FULLSCREEN_IMAGE_HEADER'].includes(editLayout) && (
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Body Text / Description</label>
                      <textarea
                        rows={4}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="Enter section description..."
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}

                  {['IMAGE_HEADER_TEXT', 'FULLSCREEN_IMAGE_HEADER'].includes(editLayout) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image URL</label>
                        <input
                          type="text"
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          placeholder="/assets/images/CareImage1.jpeg"
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Image Alt Text</label>
                        <input
                          type="text"
                          value={editImageAlt}
                          onChange={(e) => setEditImageAlt(e.target.value)}
                          placeholder="Descriptive image text"
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Button Text</label>
                        <input
                          type="text"
                          value={editButtonText}
                          onChange={(e) => setEditButtonText(e.target.value)}
                          placeholder="e.g. Schedule Consultation"
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Button Link</label>
                        <input
                          type="text"
                          value={editButtonLink}
                          onChange={(e) => setEditButtonLink(e.target.value)}
                          placeholder="/schedule"
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>
                  )}

                  {editLayout === 'MAP_SECTION' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Office Address Text</label>
                        <input
                          type="text"
                          value={editMapAddress}
                          onChange={(e) => setEditMapAddress(e.target.value)}
                          placeholder="1501 N Broadway, Ste 350A/B, Walnut Creek, CA"
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Google Maps Embed URL</label>
                        <input
                          type="text"
                          value={editEmbedUrl}
                          onChange={(e) => setEditEmbedUrl(e.target.value)}
                          placeholder="https://www.google.com/maps/embed?..."
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Directions URL</label>
                        <input
                          type="text"
                          value={editDirectionsUrl}
                          onChange={(e) => setEditDirectionsUrl(e.target.value)}
                          placeholder="https://www.google.com/maps/dir/?..."
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>
                  )}

                  {editLayout === 'CARD_GRID' && (
                    <div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Grid Columns (1-4)</label>
                        <select
                          value={editGridCols}
                          onChange={(e) => setEditGridCols(e.target.value)}
                          style={{ width: '120px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                          <option value="1">1 Column</option>
                          <option value="2">2 Columns</option>
                          <option value="3">3 Columns</option>
                          <option value="4">4 Columns</option>
                        </select>
                      </div>
                      <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>Select Cards to Include</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                        {allCards.map((c) => {
                          const isChecked = editSelectedCardIds.includes(c.id)
                          return (
                            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) setEditSelectedCardIds([...editSelectedCardIds, c.id])
                                  else setEditSelectedCardIds(editSelectedCardIds.filter(id => id !== c.id))
                                }}
                              />
                              <span><code>{c.id}</code> ({c.layout})</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {editLayout === 'FAQ_SECTION' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontWeight: '600', fontSize: '13px' }}>FAQ Items ({editFaqItems.length})</label>
                        <button
                          type="button"
                          onClick={() => setEditFaqItems([...editFaqItems, { question: '', answer: '' }])}
                          style={{ padding: '4px 10px', fontSize: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          + Add Question
                        </button>
                      </div>
                      {editFaqItems.map((item, idx) => (
                        <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
                          <input
                            type="text"
                            value={item.question}
                            onChange={(e) => {
                              const next = [...editFaqItems]
                              next[idx].question = e.target.value
                              setEditFaqItems(next)
                            }}
                            placeholder="Question"
                            style={{ width: '100%', marginBottom: '6px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                          <textarea
                            rows={2}
                            value={item.answer}
                            onChange={(e) => {
                              const next = [...editFaqItems]
                              next[idx].answer = e.target.value
                              setEditFaqItems(next)
                            }}
                            placeholder="Answer"
                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {editLayout === 'ACCOUNT_BENEFITS' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontWeight: '600', fontSize: '13px' }}>Benefit Items ({editBenefitItems.length})</label>
                        <button
                          type="button"
                          onClick={() => setEditBenefitItems([...editBenefitItems, { heading: '', description: '' }])}
                          style={{ padding: '4px 10px', fontSize: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          + Add Benefit
                        </button>
                      </div>
                      {editBenefitItems.map((item, idx) => (
                        <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
                          <input
                            type="text"
                            value={item.heading}
                            onChange={(e) => {
                              const next = [...editBenefitItems]
                              next[idx].heading = e.target.value
                              setEditBenefitItems(next)
                            }}
                            placeholder="Benefit heading"
                            style={{ width: '100%', marginBottom: '6px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => {
                              const next = [...editBenefitItems]
                              next[idx].description = e.target.value
                              setEditBenefitItems(next)
                            }}
                            placeholder="Benefit description"
                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {editLayout === 'CONTACT_FORM' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <input type="text" value={editFax} onChange={(e) => setEditFax(e.target.value)} placeholder="Fax" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <input type="text" value={editAddressLine1} onChange={(e) => setEditAddressLine1(e.target.value)} placeholder="Address line 1" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'colors' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Background Color</label>
                    <select value={editBgColor} onChange={(e) => setEditBgColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="">Default Theme</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Header Color</label>
                    <select value={editHeaderColor} onChange={(e) => setEditHeaderColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="">Default Theme</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Text Color</label>
                    <select value={editTextColor} onChange={(e) => setEditTextColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="">Default Theme</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Accent Color</label>
                    <select value={editAccentColor} onChange={(e) => setEditAccentColor(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="">Default Theme</option>
                      {colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  Save Section Changes
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Live Preview */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>Live Section Preview</h3>
          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            style={{ padding: '6px 12px', background: '#e2e8f0', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
          >
            {themeMode === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '10px', background: '#f8fafc' }}>
          <DynamicSectionRenderer config={draftSection} theme={themeMode} />
        </div>
      </div>
    </div>
  )
}
