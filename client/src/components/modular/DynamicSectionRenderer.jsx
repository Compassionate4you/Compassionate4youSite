// DT-894 DT-903 DT-918 DT-922 Sprint 9
// PBall
// Dynamic modular section renderer dispatching layout components and resolving direct element colors for light/dark themes

import React from 'react'
import { resolveElementColor } from '../admin/content/ColorEditor'
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

// DT-902: Public pages can bypass CMS palettes while other callers retain them.
export default function DynamicSectionRenderer ({ config, sectionId, theme = 'light', colorSource = 'cms' }) {
  const section = config || (sectionId ? SectionStorageService.getSectionById(sectionId) : null)
  if (!section) return null

  const content = section.content || {}
  const colors = content.colors || section.colors || {}

  // DT-902: CSS variables remain live when the root theme or global palette changes.
  // DT-918 DT-922 Sprint 9 - PBall: Resolve light/dark colors stored directly on the section element when colorSource is 'cms'
  const customStyles = colorSource === 'global'
    ? {
        '--section-bg': 'var(--color-white)',
        '--section-header': 'var(--color-white-text)',
        '--section-text': 'var(--color-white-text)',
        '--section-accent': 'var(--color-primary)'
      }
    : {
        '--section-bg': resolveElementColor(colors.backgroundColor, theme, theme === 'dark' ? '#0f172a' : '#ffffff'),
        '--section-header': resolveElementColor(colors.headerColor, theme, theme === 'dark' ? '#f8fafc' : '#0f172a'),
        '--section-text': resolveElementColor(colors.textColor, theme, theme === 'dark' ? '#cbd5e1' : '#334155'),
        '--section-accent': resolveElementColor(colors.accentColor, theme, theme === 'dark' ? '#4ade80' : '#366454')
      }

  const LayoutComponent = LAYOUT_COMPONENTS[section.layout] || HeaderTextSection

  return (
    <LayoutComponent
      config={section}
      content={content}
      colors={colors}
      theme={theme}
      colorSource={colorSource}
      style={customStyles}
    />
  )
}
