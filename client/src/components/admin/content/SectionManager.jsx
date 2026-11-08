// DT-875 DT-903 DT-920 DT-922 DT-923 DT-622 DT-618 DT-625 Sprint 9
// PBall
// Section Manager component dispatching all section layout form components with inline ColorEditor and direct element color storage

import React, { useState, useEffect } from 'react'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { PageStorageService } from '../../../services/pageStorageService'
import { CardStorageService } from '../../../services/cardStorageService'
import { AuditHistoryService } from '../../../services/auditHistoryService'
import DynamicSectionRenderer from '../../modular/DynamicSectionRenderer'
import CustomModal from './CustomModal'
import CustomSelect from './CustomSelect'
import ColorEditor, { DEFAULT_SECTION_COLORS, normalizeColorPair } from './ColorEditor'
import HeaderTextLayout from './SectionManager/HeaderTextLayout'
import ImageHeaderTextLayout from './SectionManager/ImageHeaderTextLayout'
import FullscreenImageHeaderLayout from './SectionManager/FullscreenImageHeaderLayout'
import CardGridLayout from './SectionManager/CardGridLayout'
import MapSectionLayout from './SectionManager/MapSectionLayout'
import AccountBenefitsLayout from './SectionManager/AccountBenefitsLayout'
import ContactFormLayout from './SectionManager/ContactFormLayout'
import FaqSectionLayout from './SectionManager/FaqSectionLayout'
import HeroSectionLayout from './SectionManager/HeroSectionLayout'
import HeaderCardsLayout from './SectionManager/HeaderCardsLayout'
import HeaderStackLayout from './SectionManager/HeaderStackLayout'
import TimelineSectionLayout from './SectionManager/TimelineSectionLayout'
import PageCallToActionLayout from './SectionManager/PageCallToActionLayout'

// DT-875 Sprint 9 - PBall: Complete list of available section layouts in the Content Editor
const LAYOUT_OPTIONS = [
  { value: 'HEADER_TEXT', label: 'HEADER_TEXT (Decorative Banner with Icon & Text)' },
  { value: 'HERO_SECTION', label: 'HERO_SECTION (Split Photo/Panel or Background Hero)' },
  { value: 'HEADER_CARDS', label: 'HEADER_CARDS (Split Header & Numbered Icon Cards)' },
  { value: 'HEADER_STACK', label: 'HEADER_STACK (Header & 1-2 Column Stacked Cards)' },
  { value: 'TIMELINE_SECTION', label: 'TIMELINE_SECTION (Numbered Care Process Steps)' },
  { value: 'PAGE_CTA', label: 'PAGE_CTA (Closing Call-To-Action & Links)' },
  { value: 'IMAGE_HEADER_TEXT', label: 'IMAGE_HEADER_TEXT (Hero Image, Title, Text, CTA)' },
  { value: 'FULLSCREEN_IMAGE_HEADER', label: 'FULLSCREEN_IMAGE_HEADER (Banner Overlay with CTA)' },
  { value: 'CARD_GRID', label: 'CARD_GRID (Responsive Card Columns 1-5)' },
  { value: 'MAP_SECTION', label: 'MAP_SECTION (Google Maps Embed & Directions)' },
  { value: 'ACCOUNT_BENEFITS', label: 'ACCOUNT_BENEFITS (Checklist Items)' },
  { value: 'CONTACT_FORM', label: 'CONTACT_FORM (Contact Details & Form)' },
  { value: 'FAQ_SECTION', label: 'FAQ_SECTION (Accordion Q&A Items)' }
]

export default function SectionManager ({ onNotification, setIsDirty, registerSaveHandler }) {
  const [sections, setSections] = useState(SectionStorageService.getSections())
  const pages = PageStorageService.getPages()
  const allCards = CardStorageService.getCards()

  const [mode, setMode] = useState('create')
  const [activeTab, setActiveTab] = useState('content') // 'content' | 'colors'
  const [themeMode, setThemeMode] = useState('light')

  // Create Mode state
  const [sectionId, setSectionId] = useState('')
  const [layout, setLayout] = useState('HEADER_TEXT')
  const [label, setLabel] = useState('')
  const [header, setHeader] = useState('')
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [imagePosition, setImagePosition] = useState('left')
  const [headerTypography, setHeaderTypography] = useState({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
  const [textTypography, setTextTypography] = useState({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
  const [buttonText, setButtonText] = useState('')
  const [secondaryButtonText, setSecondaryButtonText] = useState('')
  const [buttonLink, setButtonLink] = useState('')
  const [icon, setIcon] = useState('')
  const [formatBody, setFormatBody] = useState(false)
  const [heroVariant, setHeroVariant] = useState('split')
  const [heroTone, setHeroTone] = useState('teal')
  const [showOverlay, setShowOverlay] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [surface, setSurface] = useState('')
  const [mapAddress, setMapAddress] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [directionsUrl, setDirectionsUrl] = useState('')
  const [directionsText, setDirectionsText] = useState('')
  const [hideHeading, setHideHeading] = useState(false)
  const [gridCols, setGridCols] = useState(3)
  const [selectedCardIds, setSelectedCardIds] = useState([])
  const [selectedCardToAdd, setSelectedCardToAdd] = useState('')
  const [faqItems, setFaqItems] = useState([{ question: '', answer: '' }])
  const [benefitItems, setBenefitItems] = useState([{ heading: '', description: '' }])
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [fax, setFax] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [bgColor, setBgColor] = useState(DEFAULT_SECTION_COLORS.backgroundColor)
  const [headerColor, setHeaderColor] = useState(DEFAULT_SECTION_COLORS.headerColor)
  const [textColor, setTextColor] = useState(DEFAULT_SECTION_COLORS.textColor)
  const [accentColor, setAccentColor] = useState(DEFAULT_SECTION_COLORS.accentColor)

  // Manage Mode state
  const [locationFilter, setLocationFilter] = useState('all')
  const [manageSectionId, setManageSectionId] = useState('')
  const [editSectionId, setEditSectionId] = useState('')
  const [editLayout, setEditLayout] = useState('HEADER_TEXT')
  const [editLabel, setEditLabel] = useState('')
  const [editHeader, setEditHeader] = useState('')
  const [editText, setEditText] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editImageAlt, setEditImageAlt] = useState('')
  const [editImagePosition, setEditImagePosition] = useState('left')
  const [editHeaderTypography, setEditHeaderTypography] = useState({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
  const [editTextTypography, setEditTextTypography] = useState({ align: 'left', fontFamily: 'inherit', bold: false, italic: false })
  const [editButtonText, setEditButtonText] = useState('')
  const [editSecondaryButtonText, setEditSecondaryButtonText] = useState('')
  const [editButtonLink, setEditButtonLink] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editFormatBody, setEditFormatBody] = useState(false)
  const [editHeroVariant, setEditHeroVariant] = useState('split')
  const [editHeroTone, setEditHeroTone] = useState('teal')
  const [editShowOverlay, setEditShowOverlay] = useState(false)
  const [editShowLanguageSelector, setEditShowLanguageSelector] = useState(false)
  const [editSurface, setEditSurface] = useState('')
  const [editMapAddress, setEditMapAddress] = useState('')
  const [editEmbedUrl, setEditEmbedUrl] = useState('')
  const [editDirectionsUrl, setEditDirectionsUrl] = useState('')
  const [editDirectionsText, setEditDirectionsText] = useState('')
  const [editHideHeading, setEditHideHeading] = useState(false)
  const [editGridCols, setEditGridCols] = useState(3)
  const [editSelectedCardIds, setEditSelectedCardIds] = useState([])
  const [editCardToAdd, setEditCardToAdd] = useState('')
  const [editFaqItems, setEditFaqItems] = useState([])
  const [editBenefitItems, setEditBenefitItems] = useState([])
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editFax, setEditFax] = useState('')
  const [editAddressLine1, setEditAddressLine1] = useState('')
  const [editAddressLine2, setEditAddressLine2] = useState('')
  const [editBgColor, setEditBgColor] = useState(DEFAULT_SECTION_COLORS.backgroundColor)
  const [editHeaderColor, setEditHeaderColor] = useState(DEFAULT_SECTION_COLORS.headerColor)
  const [editTextColor, setEditTextColor] = useState(DEFAULT_SECTION_COLORS.textColor)
  const [editAccentColor, setEditAccentColor] = useState(DEFAULT_SECTION_COLORS.accentColor)

  // Custom modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'Confirm',
    onConfirm: null
  })

  const markDirty = () => {
    if (setIsDirty) setIsDirty(true)
  }

  const markClean = () => {
    if (setIsDirty) setIsDirty(false)
  }

  // Register save handler for unsaved changes prompt
  useEffect(() => {
    if (registerSaveHandler) {
      registerSaveHandler(() => {
        if (mode === 'create') {
          return executeCreate()
        } else {
          return executeSaveManage()
        }
      })
    }
  }, [mode, sectionId, layout, header, text, imageUrl, imageAlt, imagePosition, headerTypography, textTypography, buttonText, buttonLink, icon, mapAddress, embedUrl, directionsUrl, gridCols, selectedCardIds, faqItems, benefitItems, phone, email, fax, addressLine1, addressLine2, bgColor, headerColor, textColor, accentColor, manageSectionId, editSectionId, editLayout, editHeader, editText, editImageUrl, editImageAlt, editImagePosition, editHeaderTypography, editTextTypography, editButtonText, editButtonLink, editIcon, editMapAddress, editEmbedUrl, editDirectionsUrl, editGridCols, editSelectedCardIds, editFaqItems, editBenefitItems, editPhone, editEmail, editFax, editAddressLine1, editAddressLine2, editBgColor, editHeaderColor, editTextColor, editAccentColor])

  const handleSelectManage = (id) => {
    setManageSectionId(id)
    setEditSectionId(id)
    markClean()
    if (id) {
      const sec = SectionStorageService.getSectionById(id)
      const c = sec.content || {}
      const col = c.colors || sec.colors || {}
      const typo = c.typography || {}
      setEditLayout(sec.layout || 'HEADER_TEXT')
      setEditLabel(c.label || '')
      setEditHeader(c.header || c.title || '')
      setEditText(c.text || c.paragraph || c.subtitle || c.description || '')
      setEditImageUrl(c.imageUrl || c.backgroundImageUrl || '')
      setEditImageAlt(c.imageAlt || '')
      setEditImagePosition(c.imagePosition || c.headerPosition || c.contentPosition || 'left')
      setEditHeaderTypography(typo.header || { align: 'left', fontFamily: 'inherit', bold: false, italic: false })
      setEditTextTypography(typo.text || { align: 'left', fontFamily: 'inherit', bold: false, italic: false })
      setEditButtonText(c.buttonText || c.primaryLabel || '')
      setEditSecondaryButtonText(c.secondaryButtonText || c.homeLabel || '')
      setEditButtonLink(c.buttonLink || '')
      setEditIcon(c.icon || c.iconName || '')
      setEditFormatBody(Boolean(c.formatBody))
      setEditHeroVariant(c.heroVariant || c.variant || 'split')
      setEditHeroTone(c.heroTone || c.tone || 'teal')
      setEditShowOverlay(Boolean(c.showOverlay))
      setEditShowLanguageSelector(Boolean(c.showLanguageSelector))
      setEditSurface(c.surface || '')
      setEditMapAddress(c.mapAddress || '')
      setEditEmbedUrl(c.embedUrl || '')
      setEditDirectionsUrl(c.directionsUrl || '')
      setEditDirectionsText(c.directionsText || '')
      setEditHideHeading(Boolean(c.hideHeading))
      setEditGridCols(Number(c.gridCols || c.columns || 3))
      setEditSelectedCardIds(Array.isArray(c.cardIds) ? c.cardIds : [])
      setEditFaqItems(Array.isArray(c.faqItems) ? c.faqItems : [{ question: '', answer: '' }])
      setEditBenefitItems(Array.isArray(c.items) ? c.items : [{ heading: '', description: '' }])
      setEditPhone(c.phone || '')
      setEditEmail(c.email || '')
      setEditFax(c.fax || '')
      setEditAddressLine1(c.addressLine1 || '')
      setEditAddressLine2(c.addressLine2 || '')
      // DT-922 Sprint 9 - PBall: Normalize direct section color objects
      setEditBgColor(normalizeColorPair(col.backgroundColor, DEFAULT_SECTION_COLORS.backgroundColor))
      setEditHeaderColor(normalizeColorPair(col.headerColor, DEFAULT_SECTION_COLORS.headerColor))
      setEditTextColor(normalizeColorPair(col.textColor, DEFAULT_SECTION_COLORS.textColor))
      setEditAccentColor(normalizeColorPair(col.accentColor, DEFAULT_SECTION_COLORS.accentColor))
    }
  }

  // DT-625 Sprint 8 - Preston Ball: Save confirmation before creating section
  const handleCreate = (e) => {
    e.preventDefault()
    const trimmedId = sectionId.trim()
    if (!trimmedId) {
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please enter a Section ID.',
        type: 'alert',
        confirmText: 'OK',
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
      })
      return
    }

    setModalState({
      isOpen: true,
      title: 'Confirm Section Creation',
      message: `Are you sure you want to create section "${trimmedId}" with layout "${layout}"?`,
      type: 'confirm',
      confirmText: 'Create Section',
      onConfirm: () => {
        executeCreate()
        setModalState((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  const executeCreate = () => {
    const trimmedId = sectionId.trim()
    if (!trimmedId) return
    try {
      const sectionContent = {
        label,
        header,
        text,
        imageUrl,
        imageAlt,
        imagePosition,
        headerPosition: imagePosition,
        contentPosition: imagePosition,
        typography: {
          header: headerTypography,
          text: textTypography
        },
        buttonText,
        secondaryButtonText,
        buttonLink,
        icon,
        formatBody,
        heroVariant,
        heroTone,
        showOverlay,
        showLanguageSelector,
        surface,
        mapAddress,
        embedUrl,
        directionsUrl,
        directionsText,
        hideHeading,
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
      setSelectedCardIds([])
      setFaqItems([{ question: '', answer: '' }])
      markClean()
      onNotification(`Created section "${created.id}"`)
    } catch (err) {
      setModalState({
        isOpen: true,
        title: 'Error Creating Section',
        message: err.message,
        type: 'alert',
        confirmText: 'OK',
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
      })
    }
  }

  // DT-625 Sprint 8 - Preston Ball: Save confirmation before updating section
  const handleSaveManage = (e) => {
    e.preventDefault()
    if (!manageSectionId) return

    setModalState({
      isOpen: true,
      title: 'Confirm Save Changes',
      message: `Are you sure you want to save changes to section "${manageSectionId}"?`,
      type: 'confirm',
      confirmText: 'Save Section Changes',
      onConfirm: () => {
        executeSaveManage()
        setModalState((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  const executeSaveManage = async () => {
    if (!manageSectionId) return
    try {
      const oldSec = SectionStorageService.getSectionById(manageSectionId)
      let activeId = manageSectionId

      // DT-625 Sprint 8 - Preston Ball: Handle section rename if modified
      if (editSectionId && editSectionId !== manageSectionId) {
        await SectionStorageService.renameSection(manageSectionId, editSectionId)
        activeId = editSectionId
      }

      const updatedContent = {
        ...oldSec.content,
        label: editLabel,
        header: editHeader,
        text: editText,
        imageUrl: editImageUrl,
        imageAlt: editImageAlt,
        imagePosition: editImagePosition,
        headerPosition: editImagePosition,
        contentPosition: editImagePosition,
        typography: {
          header: editHeaderTypography,
          text: editTextTypography
        },
        buttonText: editButtonText,
        secondaryButtonText: editSecondaryButtonText,
        buttonLink: editButtonLink,
        icon: editIcon,
        formatBody: editFormatBody,
        heroVariant: editHeroVariant,
        heroTone: editHeroTone,
        showOverlay: editShowOverlay,
        showLanguageSelector: editShowLanguageSelector,
        surface: editSurface,
        mapAddress: editMapAddress,
        embedUrl: editEmbedUrl,
        directionsUrl: editDirectionsUrl,
        directionsText: editDirectionsText,
        hideHeading: editHideHeading,
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

      const updated = SectionStorageService.updateSection(activeId, {
        layout: editLayout,
        colors: updatedContent.colors,
        content: updatedContent
      })
      setSections(SectionStorageService.getSections())
      setManageSectionId(activeId)
      AuditHistoryService.recordAppliedChange({
        edits: { [`section.${activeId}`]: { before: oldSec, after: updated } }
      })
      markClean()
      onNotification(`Updated section "${activeId}"`)
    } catch (err) {
      setModalState({
        isOpen: true,
        title: 'Error Updating Section',
        message: err.message,
        type: 'alert',
        confirmText: 'OK',
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false }))
      })
    }
  }

  // DT-625 Sprint 8 - Preston Ball: Delete section custom modal
  const handleDelete = (id) => {
    setModalState({
      isOpen: true,
      title: 'Delete Section',
      message: `Are you sure you want to permanently delete section "${id}"? This action cannot be undone.`,
      type: 'delete',
      confirmText: 'Delete Section',
      onConfirm: () => {
        try {
          const removed = SectionStorageService.deleteSection(id)
          setSections(SectionStorageService.getSections())
          AuditHistoryService.recordAppliedChange({
            deletions: [{ type: 'section', id, data: removed }]
          })
          onNotification(`Deleted section "${id}"`)
          if (manageSectionId === id) setManageSectionId('')
          markClean()
        } catch (err) {
          setModalState({
            isOpen: true,
            title: 'Error Deleting Section',
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

  // Helpers for moving & removing cards in CARD_GRID
  const moveCard = (list, setList, index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= list.length) return
    const updated = [...list]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setList(updated)
    markDirty()
  }

  const removeCardFromList = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index))
    markDirty()
  }

  // Helpers for moving & removing FAQ items in FAQ_SECTION
  const moveFaqItem = (list, setList, index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= list.length) return
    const updated = [...list]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setList(updated)
    markDirty()
  }

  const removeFaqItem = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index))
    markDirty()
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
    label,
    header: header || 'Section Header Preview',
    text: text || 'Section description text goes here...',
    imageUrl: imageUrl || '/assets/images/CareImage1.jpeg',
    imageAlt: imageAlt || 'Preview Image',
    imagePosition: imagePosition || 'left',
    headerPosition: imagePosition || 'left',
    contentPosition: imagePosition || 'left',
    typography: { header: headerTypography, text: textTypography },
    buttonText: buttonText || 'Learn More',
    secondaryButtonText: secondaryButtonText || 'Back to Welcome',
    buttonLink: buttonLink || '#',
    icon,
    formatBody,
    heroVariant,
    heroTone,
    showOverlay,
    showLanguageSelector,
    surface,
    mapAddress: mapAddress || '1501 N Broadway, Ste 350A/B, Walnut Creek, CA',
    embedUrl,
    directionsUrl,
    directionsText,
    hideHeading,
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
    label: editLabel,
    header: editHeader || 'Section Header',
    text: editText || 'Section text',
    imageUrl: editImageUrl,
    imageAlt: editImageAlt,
    imagePosition: editImagePosition,
    headerPosition: editImagePosition,
    contentPosition: editImagePosition,
    typography: { header: editHeaderTypography, text: editTextTypography },
    buttonText: editButtonText,
    secondaryButtonText: editSecondaryButtonText,
    buttonLink: editButtonLink,
    icon: editIcon,
    formatBody: editFormatBody,
    heroVariant: editHeroVariant,
    heroTone: editHeroTone,
    showOverlay: editShowOverlay,
    showLanguageSelector: editShowLanguageSelector,
    surface: editSurface,
    mapAddress: editMapAddress,
    embedUrl: editEmbedUrl,
    directionsUrl: editDirectionsUrl,
    directionsText: editDirectionsText,
    hideHeading: editHideHeading,
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

  const locationFilterOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'unallocated', label: 'Unallocated Sections' },
    ...pages.map(p => ({ value: p.id, label: `Page: ${p.content?.title || p.id} (/${p.id})` }))
  ]

  // DT-875 DT-923 Sprint 9 - PBall: Dispatch per-layout form component for SectionManager
  const renderSectionLayoutFields = ({
    currentLayout,
    currentLabel,
    onLabelChange,
    currentHeader,
    onHeaderChange,
    currentHeaderTypography,
    onHeaderTypographyChange,
    currentText,
    onTextChange,
    currentTextTypography,
    onTextTypographyChange,
    currentImagePosition,
    onImagePositionChange,
    currentImageUrl,
    onImageUrlChange,
    currentImageAlt,
    onImageAltChange,
    currentButtonText,
    onButtonTextChange,
    currentSecondaryButtonText,
    onSecondaryButtonTextChange,
    currentButtonLink,
    onButtonLinkChange,
    currentIcon,
    onIconChange,
    currentFormatBody,
    onFormatBodyChange,
    currentHeroVariant,
    onHeroVariantChange,
    currentHeroTone,
    onHeroToneChange,
    currentShowOverlay,
    onShowOverlayChange,
    currentShowLanguageSelector,
    onShowLanguageSelectorChange,
    currentSurface,
    onSurfaceChange,
    currentMapAddress,
    onMapAddressChange,
    currentEmbedUrl,
    onEmbedUrlChange,
    currentDirectionsUrl,
    onDirectionsUrlChange,
    currentDirectionsText,
    onDirectionsTextChange,
    currentHideHeading,
    onHideHeadingChange,
    currentGridCols,
    onGridColsChange,
    currentSelectedCardIds,
    onSelectedCardIdsChange,
    currentCardToAdd,
    onCardToAddChange,
    onMoveCard,
    onRemoveCard,
    currentFaqItems,
    onFaqItemsChange,
    onMoveFaqItem,
    onRemoveFaqItem,
    currentBenefitItems,
    onBenefitItemsChange,
    currentPhone,
    onPhoneChange,
    currentEmail,
    onEmailChange,
    currentFax,
    onFaxChange,
    currentAddressLine1,
    onAddressLine1Change,
    currentAddressLine2,
    onAddressLine2Change
  }) => {
    switch (currentLayout) {
      case 'HERO_SECTION':
      case 'WELCOME_HERO':
        return (
          <HeroSectionLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            text={currentText}
            onTextChange={onTextChange}
            heroVariant={currentHeroVariant}
            onHeroVariantChange={onHeroVariantChange}
            contentPosition={currentImagePosition}
            onContentPositionChange={onImagePositionChange}
            heroTone={currentHeroTone}
            onHeroToneChange={onHeroToneChange}
            icon={currentIcon}
            onIconChange={onIconChange}
            imageUrl={currentImageUrl}
            onImageUrlChange={onImageUrlChange}
            imageAlt={currentImageAlt}
            onImageAltChange={onImageAltChange}
            buttonText={currentButtonText}
            onButtonTextChange={onButtonTextChange}
            buttonLink={currentButtonLink}
            onButtonLinkChange={onButtonLinkChange}
            showOverlay={currentShowOverlay}
            onShowOverlayChange={onShowOverlayChange}
            showLanguageSelector={currentShowLanguageSelector}
            onShowLanguageSelectorChange={onShowLanguageSelectorChange}
          />
        )
      case 'HEADER_CARDS':
        return (
          <HeaderCardsLayout
            label={currentLabel}
            onLabelChange={onLabelChange}
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            text={currentText}
            onTextChange={onTextChange}
            headerPosition={currentImagePosition}
            onHeaderPositionChange={onImagePositionChange}
            surface={currentSurface}
            onSurfaceChange={onSurfaceChange}
            imageUrl={currentImageUrl}
            onImageUrlChange={onImageUrlChange}
            selectedCardIds={currentSelectedCardIds}
            onSelectedCardIdsChange={onSelectedCardIdsChange}
            cardToAdd={currentCardToAdd}
            onCardToAddChange={onCardToAddChange}
            allCards={allCards}
            onMoveCard={onMoveCard}
            onRemoveCard={onRemoveCard}
          />
        )
      case 'HEADER_STACK':
        return (
          <HeaderStackLayout
            label={currentLabel}
            onLabelChange={onLabelChange}
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            text={currentText}
            onTextChange={onTextChange}
            gridCols={currentGridCols}
            onGridColsChange={onGridColsChange}
            selectedCardIds={currentSelectedCardIds}
            onSelectedCardIdsChange={onSelectedCardIdsChange}
            cardToAdd={currentCardToAdd}
            onCardToAddChange={onCardToAddChange}
            allCards={allCards}
            onMoveCard={onMoveCard}
            onRemoveCard={onRemoveCard}
            benefitItems={currentBenefitItems}
            onBenefitItemsChange={onBenefitItemsChange}
          />
        )
      case 'TIMELINE_SECTION':
        return (
          <TimelineSectionLayout
            label={currentLabel}
            onLabelChange={onLabelChange}
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            text={currentText}
            onTextChange={onTextChange}
            selectedCardIds={currentSelectedCardIds}
            onSelectedCardIdsChange={onSelectedCardIdsChange}
            cardToAdd={currentCardToAdd}
            onCardToAddChange={onCardToAddChange}
            allCards={allCards}
            onMoveCard={onMoveCard}
            onRemoveCard={onRemoveCard}
            benefitItems={currentBenefitItems}
            onBenefitItemsChange={onBenefitItemsChange}
          />
        )
      case 'PAGE_CTA':
        return (
          <PageCallToActionLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            text={currentText}
            onTextChange={onTextChange}
            buttonText={currentButtonText}
            onButtonTextChange={onButtonTextChange}
            secondaryButtonText={currentSecondaryButtonText}
            onSecondaryButtonTextChange={onSecondaryButtonTextChange}
          />
        )
      case 'IMAGE_HEADER_TEXT':
        return (
          <ImageHeaderTextLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            headerTypography={currentHeaderTypography}
            onHeaderTypographyChange={onHeaderTypographyChange}
            text={currentText}
            onTextChange={onTextChange}
            textTypography={currentTextTypography}
            onTextTypographyChange={onTextTypographyChange}
            imagePosition={currentImagePosition}
            onImagePositionChange={onImagePositionChange}
            imageUrl={currentImageUrl}
            onImageUrlChange={onImageUrlChange}
            imageAlt={currentImageAlt}
            onImageAltChange={onImageAltChange}
            buttonText={currentButtonText}
            onButtonTextChange={onButtonTextChange}
            buttonLink={currentButtonLink}
            onButtonLinkChange={onButtonLinkChange}
          />
        )
      case 'FULLSCREEN_IMAGE_HEADER':
        return (
          <FullscreenImageHeaderLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            headerTypography={currentHeaderTypography}
            onHeaderTypographyChange={onHeaderTypographyChange}
            text={currentText}
            onTextChange={onTextChange}
            textTypography={currentTextTypography}
            onTextTypographyChange={onTextTypographyChange}
            icon={currentIcon}
            onIconChange={onIconChange}
            imageUrl={currentImageUrl}
            onImageUrlChange={onImageUrlChange}
            imageAlt={currentImageAlt}
            onImageAltChange={onImageAltChange}
            buttonText={currentButtonText}
            onButtonTextChange={onButtonTextChange}
            buttonLink={currentButtonLink}
            onButtonLinkChange={onButtonLinkChange}
          />
        )
      case 'MAP_SECTION':
        return (
          <MapSectionLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            headerTypography={currentHeaderTypography}
            onHeaderTypographyChange={onHeaderTypographyChange}
            hideHeading={currentHideHeading}
            onHideHeadingChange={onHideHeadingChange}
            mapAddress={currentMapAddress}
            onMapAddressChange={onMapAddressChange}
            embedUrl={currentEmbedUrl}
            onEmbedUrlChange={onEmbedUrlChange}
            directionsUrl={currentDirectionsUrl}
            onDirectionsUrlChange={onDirectionsUrlChange}
            directionsText={currentDirectionsText}
            onDirectionsTextChange={onDirectionsTextChange}
          />
        )
      case 'CARD_GRID':
        return (
          <CardGridLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            headerTypography={currentHeaderTypography}
            onHeaderTypographyChange={onHeaderTypographyChange}
            gridCols={currentGridCols}
            onGridColsChange={onGridColsChange}
            selectedCardIds={currentSelectedCardIds}
            onSelectedCardIdsChange={onSelectedCardIdsChange}
            cardToAdd={currentCardToAdd}
            onCardToAddChange={onCardToAddChange}
            allCards={allCards}
            onMoveCard={onMoveCard}
            onRemoveCard={onRemoveCard}
          />
        )
      case 'FAQ_SECTION':
        return (
          <FaqSectionLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            headerTypography={currentHeaderTypography}
            onHeaderTypographyChange={onHeaderTypographyChange}
            faqItems={currentFaqItems}
            onFaqItemsChange={onFaqItemsChange}
            onMoveFaqItem={onMoveFaqItem}
            onRemoveFaqItem={onRemoveFaqItem}
          />
        )
      case 'ACCOUNT_BENEFITS':
        return (
          <AccountBenefitsLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            headerTypography={currentHeaderTypography}
            onHeaderTypographyChange={onHeaderTypographyChange}
            benefitItems={currentBenefitItems}
            onBenefitItemsChange={onBenefitItemsChange}
          />
        )
      case 'CONTACT_FORM':
        return (
          <ContactFormLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            headerTypography={currentHeaderTypography}
            onHeaderTypographyChange={onHeaderTypographyChange}
            phone={currentPhone}
            onPhoneChange={onPhoneChange}
            email={currentEmail}
            onEmailChange={onEmailChange}
            fax={currentFax}
            onFaxChange={onFaxChange}
            addressLine1={currentAddressLine1}
            onAddressLine1Change={onAddressLine1Change}
            addressLine2={currentAddressLine2}
            onAddressLine2Change={onAddressLine2Change}
          />
        )
      case 'HEADER_TEXT':
      default:
        return (
          <HeaderTextLayout
            header={currentHeader}
            onHeaderChange={onHeaderChange}
            headerTypography={currentHeaderTypography}
            onHeaderTypographyChange={onHeaderTypographyChange}
            text={currentText}
            onTextChange={onTextChange}
            textTypography={currentTextTypography}
            onTextTypographyChange={onTextTypographyChange}
            icon={currentIcon}
            onIconChange={onIconChange}
            formatBody={currentFormatBody}
            onFormatBodyChange={onFormatBodyChange}
          />
        )
    }
  }

  return (
    <div className="content-editor-card">
      <h2>Section Manager</h2>
      <p className="content-editor-card-description">
        Configure modular sections with layout-specific fields, image position toggles, theme color variables, and live dynamic preview.
      </p>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => { setMode('create'); markClean() }}
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
          onClick={() => { setMode('manage'); markClean() }}
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
                onChange={(e) => { setSectionId(e.target.value); markDirty() }}
                placeholder="e.g. sec-home-services"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Section Layout</label>
              <CustomSelect
                value={layout}
                onChange={(val) => { setLayout(val); markDirty() }}
                options={LAYOUT_OPTIONS}
                ariaLabel="Select Section Layout"
              />
            </div>
          </div>

          {/* DT-875 DT-923 Sprint 9 - PBall: Render separated section layout component in create mode */}
          {activeTab === 'content' && renderSectionLayoutFields({
            currentLayout: layout,
            currentLabel: label,
            onLabelChange: (val) => { setLabel(val); markDirty() },
            currentHeader: header,
            onHeaderChange: (val) => { setHeader(val); markDirty() },
            currentHeaderTypography: headerTypography,
            onHeaderTypographyChange: (val) => { setHeaderTypography(val); markDirty() },
            currentText: text,
            onTextChange: (val) => { setText(val); markDirty() },
            currentTextTypography: textTypography,
            onTextTypographyChange: (val) => { setTextTypography(val); markDirty() },
            currentImagePosition: imagePosition,
            onImagePositionChange: (val) => { setImagePosition(val); markDirty() },
            currentImageUrl: imageUrl,
            onImageUrlChange: (val) => { setImageUrl(val); markDirty() },
            currentImageAlt: imageAlt,
            onImageAltChange: (val) => { setImageAlt(val); markDirty() },
            currentButtonText: buttonText,
            onButtonTextChange: (val) => { setButtonText(val); markDirty() },
            currentSecondaryButtonText: secondaryButtonText,
            onSecondaryButtonTextChange: (val) => { setSecondaryButtonText(val); markDirty() },
            currentButtonLink: buttonLink,
            onButtonLinkChange: (val) => { setButtonLink(val); markDirty() },
            currentIcon: icon,
            onIconChange: (val) => { setIcon(val); markDirty() },
            currentFormatBody: formatBody,
            onFormatBodyChange: (val) => { setFormatBody(val); markDirty() },
            currentHeroVariant: heroVariant,
            onHeroVariantChange: (val) => { setHeroVariant(val); markDirty() },
            currentHeroTone: heroTone,
            onHeroToneChange: (val) => { setHeroTone(val); markDirty() },
            currentShowOverlay: showOverlay,
            onShowOverlayChange: (val) => { setShowOverlay(val); markDirty() },
            currentShowLanguageSelector: showLanguageSelector,
            onShowLanguageSelectorChange: (val) => { setShowLanguageSelector(val); markDirty() },
            currentSurface: surface,
            onSurfaceChange: (val) => { setSurface(val); markDirty() },
            currentMapAddress: mapAddress,
            onMapAddressChange: (val) => { setMapAddress(val); markDirty() },
            currentEmbedUrl: embedUrl,
            onEmbedUrlChange: (val) => { setEmbedUrl(val); markDirty() },
            currentDirectionsUrl: directionsUrl,
            onDirectionsUrlChange: (val) => { setDirectionsUrl(val); markDirty() },
            currentDirectionsText: directionsText,
            onDirectionsTextChange: (val) => { setDirectionsText(val); markDirty() },
            currentHideHeading: hideHeading,
            onHideHeadingChange: (val) => { setHideHeading(val); markDirty() },
            currentGridCols: gridCols,
            onGridColsChange: (val) => { setGridCols(val); markDirty() },
            currentSelectedCardIds: selectedCardIds,
            onSelectedCardIdsChange: (val) => { setSelectedCardIds(val); markDirty() },
            currentCardToAdd: selectedCardToAdd,
            onCardToAddChange: (val) => setSelectedCardToAdd(val),
            onMoveCard: (idx, dir) => moveCard(selectedCardIds, setSelectedCardIds, idx, dir),
            onRemoveCard: (idx) => removeCardFromList(selectedCardIds, setSelectedCardIds, idx),
            currentFaqItems: faqItems,
            onFaqItemsChange: (val) => { setFaqItems(val); markDirty() },
            onMoveFaqItem: (idx, dir) => moveFaqItem(faqItems, setFaqItems, idx, dir),
            onRemoveFaqItem: (idx) => removeFaqItem(faqItems, setFaqItems, idx),
            currentBenefitItems: benefitItems,
            onBenefitItemsChange: (val) => { setBenefitItems(val); markDirty() },
            currentPhone: phone,
            onPhoneChange: (val) => { setPhone(val); markDirty() },
            currentEmail: email,
            onEmailChange: (val) => { setEmail(val); markDirty() },
            currentFax: fax,
            onFaxChange: (val) => { setFax(val); markDirty() },
            currentAddressLine1: addressLine1,
            onAddressLine1Change: (val) => { setAddressLine1(val); markDirty() },
            currentAddressLine2: addressLine2,
            onAddressLine2Change: (val) => { setAddressLine2(val); markDirty() }
          })}

          {/* DT-920 DT-922 Sprint 9 - PBall: Inline color editor storing light/dark colors directly in section */}
          {activeTab === 'colors' && (
            <ColorEditor
              fields={[
                {
                  key: 'backgroundColor',
                  label: 'Background Color',
                  value: bgColor,
                  defaultPair: DEFAULT_SECTION_COLORS.backgroundColor,
                  onChange: (val) => { setBgColor(val); markDirty() }
                },
                {
                  key: 'headerColor',
                  label: 'Header Color',
                  value: headerColor,
                  defaultPair: DEFAULT_SECTION_COLORS.headerColor,
                  onChange: (val) => { setHeaderColor(val); markDirty() }
                },
                {
                  key: 'textColor',
                  label: 'Text Color',
                  value: textColor,
                  defaultPair: DEFAULT_SECTION_COLORS.textColor,
                  onChange: (val) => { setTextColor(val); markDirty() }
                },
                {
                  key: 'accentColor',
                  label: 'Accent Color',
                  value: accentColor,
                  defaultPair: DEFAULT_SECTION_COLORS.accentColor,
                  onChange: (val) => { setAccentColor(val); markDirty() }
                }
              ]}
            />
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
              <CustomSelect
                value={locationFilter}
                onChange={(val) => setLocationFilter(val)}
                options={locationFilterOptions}
                ariaLabel="Filter sections by location"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Select Section to Edit</label>
              <CustomSelect
                value={manageSectionId}
                onChange={(val) => handleSelectManage(val)}
                options={filteredSections.map(s => ({ value: s.id, label: `${s.id} (${s.layout})` }))}
                placeholder="Select a Section..."
                ariaLabel="Select Section to Edit"
              />
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

              {/* DT-625 Sprint 8 - Preston Ball: Allow renaming section ID */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                  Section ID (Rename)
                </label>
                <input
                  type="text"
                  required
                  value={editSectionId}
                  onChange={(e) => { setEditSectionId(e.target.value); markDirty() }}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Section Layout</label>
                <CustomSelect
                  value={editLayout}
                  onChange={(val) => { setEditLayout(val); markDirty() }}
                  options={LAYOUT_OPTIONS}
                  ariaLabel="Section Layout"
                />
              </div>

              {/* DT-875 DT-923 Sprint 9 - PBall: Render separated section layout component in manage mode */}
              {activeTab === 'content' && renderSectionLayoutFields({
                currentLayout: editLayout,
                currentLabel: editLabel,
                onLabelChange: (val) => { setEditLabel(val); markDirty() },
                currentHeader: editHeader,
                onHeaderChange: (val) => { setEditHeader(val); markDirty() },
                currentHeaderTypography: editHeaderTypography,
                onHeaderTypographyChange: (val) => { setEditHeaderTypography(val); markDirty() },
                currentText: editText,
                onTextChange: (val) => { setEditText(val); markDirty() },
                currentTextTypography: editTextTypography,
                onTextTypographyChange: (val) => { setEditTextTypography(val); markDirty() },
                currentImagePosition: editImagePosition,
                onImagePositionChange: (val) => { setEditImagePosition(val); markDirty() },
                currentImageUrl: editImageUrl,
                onImageUrlChange: (val) => { setEditImageUrl(val); markDirty() },
                currentImageAlt: editImageAlt,
                onImageAltChange: (val) => { setEditImageAlt(val); markDirty() },
                currentButtonText: editButtonText,
                onButtonTextChange: (val) => { setEditButtonText(val); markDirty() },
                currentSecondaryButtonText: editSecondaryButtonText,
                onSecondaryButtonTextChange: (val) => { setEditSecondaryButtonText(val); markDirty() },
                currentButtonLink: editButtonLink,
                onButtonLinkChange: (val) => { setEditButtonLink(val); markDirty() },
                currentIcon: editIcon,
                onIconChange: (val) => { setEditIcon(val); markDirty() },
                currentFormatBody: editFormatBody,
                onFormatBodyChange: (val) => { setEditFormatBody(val); markDirty() },
                currentHeroVariant: editHeroVariant,
                onHeroVariantChange: (val) => { setEditHeroVariant(val); markDirty() },
                currentHeroTone: editHeroTone,
                onHeroToneChange: (val) => { setEditHeroTone(val); markDirty() },
                currentShowOverlay: editShowOverlay,
                onShowOverlayChange: (val) => { setEditShowOverlay(val); markDirty() },
                currentShowLanguageSelector: editShowLanguageSelector,
                onShowLanguageSelectorChange: (val) => { setEditShowLanguageSelector(val); markDirty() },
                currentSurface: editSurface,
                onSurfaceChange: (val) => { setEditSurface(val); markDirty() },
                currentMapAddress: editMapAddress,
                onMapAddressChange: (val) => { setEditMapAddress(val); markDirty() },
                currentEmbedUrl: editEmbedUrl,
                onEmbedUrlChange: (val) => { setEditEmbedUrl(val); markDirty() },
                currentDirectionsUrl: editDirectionsUrl,
                onDirectionsUrlChange: (val) => { setEditDirectionsUrl(val); markDirty() },
                currentDirectionsText: editDirectionsText,
                onDirectionsTextChange: (val) => { setEditDirectionsText(val); markDirty() },
                currentHideHeading: editHideHeading,
                onHideHeadingChange: (val) => { setEditHideHeading(val); markDirty() },
                currentGridCols: editGridCols,
                onGridColsChange: (val) => { setEditGridCols(val); markDirty() },
                currentSelectedCardIds: editSelectedCardIds,
                onSelectedCardIdsChange: (val) => { setEditSelectedCardIds(val); markDirty() },
                currentCardToAdd: editCardToAdd,
                onCardToAddChange: (val) => setEditCardToAdd(val),
                onMoveCard: (idx, dir) => moveCard(editSelectedCardIds, setEditSelectedCardIds, idx, dir),
                onRemoveCard: (idx) => removeCardFromList(editSelectedCardIds, setEditSelectedCardIds, idx),
                currentFaqItems: editFaqItems,
                onFaqItemsChange: (val) => { setEditFaqItems(val); markDirty() },
                onMoveFaqItem: (idx, dir) => moveFaqItem(editFaqItems, setEditFaqItems, idx, dir),
                onRemoveFaqItem: (idx) => removeFaqItem(editFaqItems, setEditFaqItems, idx),
                currentBenefitItems: editBenefitItems,
                onBenefitItemsChange: (val) => { setEditBenefitItems(val); markDirty() },
                currentPhone: editPhone,
                onPhoneChange: (val) => { setEditPhone(val); markDirty() },
                currentEmail: editEmail,
                onEmailChange: (val) => { setEditEmail(val); markDirty() },
                currentFax: editFax,
                onFaxChange: (val) => { setEditFax(val); markDirty() },
                currentAddressLine1: editAddressLine1,
                onAddressLine1Change: (val) => { setEditAddressLine1(val); markDirty() },
                currentAddressLine2: editAddressLine2,
                onAddressLine2Change: (val) => { setEditAddressLine2(val); markDirty() }
              })}

              {/* DT-920 DT-922 Sprint 9 - PBall: Inline color editor in section manage mode */}
              {activeTab === 'colors' && (
                <ColorEditor
                  fields={[
                    {
                      key: 'backgroundColor',
                      label: 'Background Color',
                      value: editBgColor,
                      defaultPair: DEFAULT_SECTION_COLORS.backgroundColor,
                      onChange: (val) => { setEditBgColor(val); markDirty() }
                    },
                    {
                      key: 'headerColor',
                      label: 'Header Color',
                      value: editHeaderColor,
                      defaultPair: DEFAULT_SECTION_COLORS.headerColor,
                      onChange: (val) => { setEditHeaderColor(val); markDirty() }
                    },
                    {
                      key: 'textColor',
                      label: 'Text Color',
                      value: editTextColor,
                      defaultPair: DEFAULT_SECTION_COLORS.textColor,
                      onChange: (val) => { setEditTextColor(val); markDirty() }
                    },
                    {
                      key: 'accentColor',
                      label: 'Accent Color',
                      value: editAccentColor,
                      defaultPair: DEFAULT_SECTION_COLORS.accentColor,
                      onChange: (val) => { setEditAccentColor(val); markDirty() }
                    }
                  ]}
                />
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
        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '10px', background: themeMode === 'dark' ? '#0f172a' : '#f8fafc', overflowX: 'hidden' }}>
          <DynamicSectionRenderer config={draftSection} theme={themeMode} />
        </div>
      </div>

      {/* DT-625 Sprint 8 - Preston Ball: Reusable custom modal dialog */}
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
