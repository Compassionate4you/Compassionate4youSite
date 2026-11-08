// DT-875 DT-894 DT-903 DT-918 DT-922 Sprint 9
// PBall
// Dynamic modular section renderer dispatching all section layouts and resolving direct element colors for light/dark themes

import React from 'react'
import { useTranslation } from 'react-i18next'
import { resolveElementColor } from '../admin/content/ColorEditor'
import { SectionStorageService } from '../../services/sectionStorageService'
import { CardStorageService } from '../../services/cardStorageService'
import { pickText } from './cards/CardBase'
import ImageHeaderTextSection from './sections/ImageHeaderTextSection'
import FullscreenImageHeaderSection from './sections/FullscreenImageHeaderSection'
import HeaderTextSection from './sections/HeaderTextSection'
import MapSection from './sections/MapSection'
import CardSection from './sections/CardSection'
import AccountBenefitsSection from './sections/AccountBenefitsSection'
import ContactFormSection from './sections/ContactFormSection'
import FAQSection from './sections/FAQSection'
import HeroSection from './sections/HeroSection'
import WelcomeHeroSection from './sections/WelcomeHeroSection'
import HeaderCardsSection from './sections/HeaderCardsSection'
import HeaderStackSection from './sections/HeaderStackSection'
import TimelineSection from './sections/TimelineSection'
import PageCallToAction from './sections/PageCallToAction'

const LAYOUT_COMPONENTS = {
  IMAGE_HEADER_TEXT: ImageHeaderTextSection,
  FULLSCREEN_IMAGE_HEADER: FullscreenImageHeaderSection,
  HEADER_TEXT: HeaderTextSection,
  BANNER_SECTION: HeaderTextSection,
  MAP_SECTION: MapSection,
  CARD_GRID: CardSection,
  CARD_SECTION: CardSection,
  ACCOUNT_BENEFITS: AccountBenefitsSection,
  CONTACT_FORM: ContactFormSection,
  CONTACT_SECTION: ContactFormSection,
  FAQ_SECTION: FAQSection,
  FAQ: FAQSection
}

// DT-875 Sprint 9 - PBall: Resolve card references and inline items for HeaderCards, HeaderStack, and Timeline layouts
function resolveSectionItems (content = {}, lang = 'en', stripStepNumbers = false) {
  const cardIds = Array.isArray(content.cardIds) ? content.cardIds : []
  const resolvedFromCards = cardIds
    .map((id) => CardStorageService.getCardById(id))
    .filter(Boolean)
    .map((card, index) => {
      const c = card.content || {}
      const rawTitle = pickText(c.header ?? card.header ?? '', lang)
      const title = stripStepNumbers ? rawTitle.replace(/^\s*\d+\.\s*/, '') : rawTitle
      const rawBody = pickText(c.paragraph || c.text || card.paragraph || '', lang)
      const lines = String(rawBody).split('\n').map(l => l.trim()).filter(Boolean)
      const bulletLines = lines.filter(l => l.startsWith('- ')).map(l => l.slice(2).trim())
      const textLines = lines.filter(l => !l.startsWith('- '))
      return {
        id: card.id || `card-item-${index}`,
        title,
        description: textLines.join('\n') || undefined,
        listItems: bulletLines.length > 0 ? bulletLines : undefined,
        iconName: c.symbol || c.iconName || card.symbol || 'Heart'
      }
    })

  const inlineItems = Array.isArray(content.items)
    ? content.items
      .filter(item => item && (item.heading || item.title || item.description))
      .map((item, idx) => {
        const rawTitle = pickText(item.title || item.heading || '', lang)
        return {
          id: item.id || `inline-item-${idx}`,
          title: stripStepNumbers ? rawTitle.replace(/^\s*\d+\.\s*/, '') : rawTitle,
          description: pickText(item.description || '', lang) || undefined,
          listItems: Array.isArray(item.listItems) ? item.listItems : undefined,
          iconName: item.iconName || 'Heart'
        }
      })
    : []

  return resolvedFromCards.length > 0 ? [...resolvedFromCards, ...inlineItems] : inlineItems
}

// DT-902: Public pages can bypass CMS palettes while other callers retain them.
export default function DynamicSectionRenderer ({ config, sectionId, theme = 'light', colorSource = 'cms' }) {
  const { i18n } = useTranslation()
  const section = config || (sectionId ? SectionStorageService.getSectionById(sectionId) : null)
  if (!section) return null

  const content = section.content || {}
  const colors = content.colors || section.colors || {}
  const lang = i18n.language || 'en'

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

  // DT-875 Sprint 9 - PBall: Dispatch newly added modular section layouts
  if (section.layout === 'WELCOME_HERO' || (section.layout === 'HERO_SECTION' && content.heroVariant === 'welcome')) {
    return (
      <WelcomeHeroSection
        title={pickText(content.header || content.title || section.title || '', lang)}
        description={pickText(content.text || content.description || content.subtitle || '', lang)}
        imageUrl={content.imageUrl}
        imageAlt={pickText(content.imageAlt || '', lang)}
      />
    )
  }

  if (section.layout === 'HERO_SECTION') {
    return (
      <HeroSection
        title={pickText(content.header || content.title || section.title || '', lang)}
        description={pickText(content.text || content.description || content.subtitle || '', lang)}
        imageUrl={content.imageUrl}
        imageAlt={pickText(content.imageAlt || '', lang)}
        variant={content.heroVariant || content.variant || 'split'}
        contentPosition={content.contentPosition || content.imagePosition || 'left'}
        tone={content.heroTone || content.tone || 'teal'}
        iconName={content.icon || content.iconName || undefined}
        buttonText={pickText(content.buttonText || '', lang)}
        buttonLink={content.buttonLink || '/schedule'}
        showOverlay={content.showOverlay !== undefined ? Boolean(content.showOverlay) : false}
        showLanguageSelector={Boolean(content.showLanguageSelector)}
      />
    )
  }

  if (section.layout === 'HEADER_CARDS') {
    return (
      <HeaderCardsSection
        title={pickText(content.header || content.title || section.title || '', lang)}
        subtitle={pickText(content.text || content.subtitle || '', lang)}
        label={pickText(content.label || '', lang)}
        items={resolveSectionItems(content, lang, false)}
        backgroundImageUrl={content.imageUrl || content.backgroundImageUrl || undefined}
        headerPosition={content.headerPosition || content.imagePosition || 'left'}
        surface={content.surface || undefined}
      />
    )
  }

  if (section.layout === 'HEADER_STACK') {
    return (
      <HeaderStackSection
        title={pickText(content.header || content.title || section.title || '', lang)}
        subtitle={pickText(content.text || content.subtitle || '', lang)}
        label={pickText(content.label || '', lang)}
        items={resolveSectionItems(content, lang, false)}
        columns={Number(content.gridCols || content.columns || 1)}
      />
    )
  }

  if (section.layout === 'TIMELINE_SECTION') {
    return (
      <TimelineSection
        title={pickText(content.header || content.title || section.title || '', lang)}
        subtitle={pickText(content.text || content.subtitle || '', lang)}
        label={pickText(content.label || '', lang)}
        items={resolveSectionItems(content, lang, true)}
      />
    )
  }

  if (section.layout === 'PAGE_CTA') {
    return (
      <PageCallToAction
        title={pickText(content.header || content.title || section.title || '', lang)}
        description={pickText(content.text || content.description || content.subtitle || '', lang)}
        primaryLabel={pickText(content.buttonText || content.primaryLabel || 'Schedule a Consultation', lang)}
        homeLabel={pickText(content.secondaryButtonText || content.homeLabel || 'Back to Welcome', lang)}
      />
    )
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
