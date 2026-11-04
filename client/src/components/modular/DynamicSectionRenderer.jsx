// DT-622 Sprint 8
// Preston Ball
// Dynamic modular section renderer dispatching layout components and injecting theme color tokens

import React from 'react'
import { ColorConfigService } from '../../services/colorConfigService'
import { SectionStorageService } from '../../services/sectionStorageService'
import ImageHeaderTextSection from './sections/ImageHeaderTextSection'
import FullscreenImageHeaderSection from './sections/FullscreenImageHeaderSection'
import HeaderTextSection from './sections/HeaderTextSection'
import MapSection from './sections/MapSection'
import CardSection from './sections/CardSection'
import AccountBenefitsSection from './sections/AccountBenefitsSection'
import ContactFormSection from './sections/ContactFormSection'
import FAQSection from './sections/FAQSection'

const LAYOUT_COMPONENTS = {
  IMAGE_HEADER_TEXT: ImageHeaderTextSection,
  FULLSCREEN_IMAGE_HEADER: FullscreenImageHeaderSection,
  HEADER_TEXT: HeaderTextSection,
  MAP_SECTION: MapSection,
  CARD_GRID: CardSection,
  CARD_SECTION: CardSection,
  ACCOUNT_BENEFITS: AccountBenefitsSection,
  CONTACT_FORM: ContactFormSection,
  CONTACT_SECTION: ContactFormSection,
  FAQ_SECTION: FAQSection,
  FAQ: FAQSection
}

export default function DynamicSectionRenderer ({ config, sectionId, theme = 'light' }) {
  const section = config || (sectionId ? SectionStorageService.getSectionById(sectionId) : null)
  if (!section) return null

  const content = section.content || {}
  const colors = content.colors || section.colors || {}

  const resolveColor = (colorId, fallback) => {
    if (!colorId) return fallback
    const c = ColorConfigService.getColorById(colorId)
    if (!c) return fallback
    return theme === 'dark' ? c.darkModeColor : c.lightModeColor
  }

  const customStyles = {
    '--section-bg': resolveColor(colors.backgroundColor, theme === 'dark' ? '#0f172a' : '#ffffff'),
    '--section-header': resolveColor(colors.headerColor, theme === 'dark' ? '#f8fafc' : '#0f172a'),
    '--section-text': resolveColor(colors.textColor, theme === 'dark' ? '#cbd5e1' : '#334155'),
    '--section-accent': resolveColor(colors.accentColor, '#366454')
  }

  const LayoutComponent = LAYOUT_COMPONENTS[section.layout] || HeaderTextSection

  return (
    <LayoutComponent
      config={section}
      content={content}
      colors={colors}
      theme={theme}
      style={customStyles}
    />
  )
}

