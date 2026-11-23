// DT-875 DT-894 DT-903 DT-918 DT-922 Sprint 9
// PBall
// Dynamic modular section renderer dispatching all section layouts and resolving direct element colors for light/dark themes

import React from 'react'
import { useTranslation } from 'react-i18next'
import { resolveElementColor, getContrastTextColor, ensureReadableTextColor } from '../admin/content/ColorEditor'
import { SectionStorageService } from '../../services/sectionStorageService'
import { CardStorageService } from '../../services/cardStorageService'
import { pickText } from './cards/CardBase'
import ImageHeaderTextSection from './sections/ImageHeaderTextSection'
import FullscreenImageHeaderSection from './sections/FullscreenImageHeaderSection'
import HeaderTextSection from './sections/HeaderTextSection'
import MapSection from './sections/MapSection'
import LocationMaps from './sections/LocationMaps'
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
import TypographyScope from './TypographyScope'

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

function computeAccentTextColor (accentValue) {
  return getContrastTextColor(accentValue)
}

// DT-875 Sprint 9 - PBall: Resolve card references and inline items for HeaderCards, HeaderStack, and Timeline layouts
function resolveSectionItems (content = {}, lang = 'en', stripStepNumbers = false, theme = 'light', colorSource = 'cms') {
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
      const cardColors = c.colors || card.colors
      let style
      if (colorSource === 'cms' && cardColors && (cardColors.backgroundColor || cardColors.headerColor || cardColors.textColor)) {
        const cardBg = resolveElementColor(cardColors.backgroundColor, theme, theme === 'dark' ? '#1e293b' : '#ffffff')
        style = {
          ...(cardColors.backgroundColor ? { '--card-bg': cardBg } : {}),
          ...(cardColors.headerColor ? { '--card-header': ensureReadableTextColor(resolveElementColor(cardColors.headerColor, theme, theme === 'dark' ? '#f8fafc' : '#0f172a'), cardBg) } : {}),
          ...(cardColors.textColor ? { '--card-text': ensureReadableTextColor(resolveElementColor(cardColors.textColor, theme, theme === 'dark' ? '#cbd5e1' : '#334155'), cardBg) } : {})
        }
      }
      return {
        id: card.id || `card-item-${index}`,
        title,
        description: textLines.join('\n') || undefined,
        listItems: bulletLines.length > 0 ? bulletLines : undefined,
        iconName: c.symbol || c.iconName || card.symbol || 'Heart',
        style
      }
    })

  const inlineItems = Array.isArray(content.items)
    ? content.items
      .filter(item => item && (item.heading || item.title || item.description))
      .map((item, idx) => {
        const rawTitle = pickText(item.title || item.heading || '', lang)
        const rawDesc = pickText(item.description || '', lang)
        const lines = String(rawDesc).split('\n').map(l => l.trim()).filter(Boolean)
        const bulletLines = lines.filter(l => l.startsWith('- ')).map(l => l.slice(2).trim())
        const textLines = lines.filter(l => !l.startsWith('- '))
        const explicitList = Array.isArray(item.listItems) ? item.listItems : undefined
        return {
          id: item.id || `inline-item-${idx}`,
          title: stripStepNumbers ? rawTitle.replace(/^\s*\d+\.\s*/, '') : rawTitle,
          description: (explicitList ? rawDesc : textLines.join('\n')) || undefined,
          listItems: explicitList || (bulletLines.length > 0 ? bulletLines : undefined),
          iconName: item.iconName || item.symbol || 'Heart'
        }
      })
    : []

  return resolvedFromCards.length > 0 ? [...resolvedFromCards, ...inlineItems] : inlineItems
}

// DT-893: applies the section's saved formatting to its title and
// description for every layout, including ones that do not read it
// themselves (fullscreen header, map, contact form, FAQ, account benefits).
export default function DynamicSectionRenderer (props) {
  const section = props.config || (props.sectionId ? SectionStorageService.getSectionById(props.sectionId) : null)
  return (
    <TypographyScope typography={section?.content?.typography}>
      <SectionBody {...props} />
    </TypographyScope>
  )
}

// DT-902: Public pages can bypass CMS palettes while other callers retain them.
function SectionBody ({ config, sectionId, theme = 'light', colorSource = 'cms' }) {
  const { i18n } = useTranslation()
  const section = config || (sectionId ? SectionStorageService.getSectionById(sectionId) : null)
  if (!section) return null

  const content = section.content || {}
  const colors = content.colors || section.colors || {}
  const lang = i18n.language || 'en'

  // DT-902: CSS variables remain live when the root theme or global palette changes.
  // DT-918 DT-922 Sprint 9 - PBall: Resolve light/dark colors stored directly on the section element when colorSource is 'cms'
  const resolvedBg = colorSource === 'global'
    ? 'var(--color-white)'
    : resolveElementColor(colors.backgroundColor, theme, theme === 'dark' ? '#0f172a' : '#ffffff')
  const resolvedHeader = colorSource === 'global'
    ? 'var(--color-white-text)'
    : ensureReadableTextColor(
      resolveElementColor(colors.headerColor, theme, theme === 'dark' ? '#f8fafc' : '#0f172a'),
      resolvedBg
    )
  const resolvedText = colorSource === 'global'
    ? 'var(--color-white-text)'
    : ensureReadableTextColor(
      resolveElementColor(colors.textColor, theme, theme === 'dark' ? '#cbd5e1' : '#334155'),
      resolvedBg
    )
  const resolvedAccent = colorSource === 'global'
    ? 'var(--color-primary)'
    : resolveElementColor(colors.accentColor, theme, theme === 'dark' ? '#4ade80' : '#366454')

  const customStyles = colorSource === 'global'
    ? {
        '--section-bg': resolvedBg,
        '--section-header': resolvedHeader,
        '--section-text': resolvedText,
        '--section-accent': resolvedAccent,
        '--section-accent-text': 'var(--color-primary-text)'
      }
    : {
        '--section-bg': resolvedBg,
        '--section-header': resolvedHeader,
        '--section-text': resolvedText,
        '--section-accent': resolvedAccent,
        '--section-accent-text': computeAccentTextColor(resolvedAccent)
      }

  // DT-875 Sprint 9 - PBall: Dispatch newly added modular section layouts
  if (section.layout === 'WELCOME_HERO' || (section.layout === 'HERO_SECTION' && content.heroVariant === 'welcome')) {
    return (
      <WelcomeHeroSection
        title={pickText(content.header || content.title || section.title || '', lang)}
        description={pickText(content.text || content.description || content.subtitle || '', lang)}
        imageUrl={content.imageUrl}
        imageAlt={pickText(content.imageAlt || '', lang)}
        style={customStyles}
      />
    )
  }

  if (section.layout === 'HERO_SECTION') {
    const variant = content.heroVariant || content.variant || 'split'
    const tone = content.heroTone || content.tone || 'teal'
    const heroClassName = content.className || (
      variant === 'split'
        ? (tone === 'teal' ? 'c4-home-health-hero' : (tone === 'forest' ? 'c4-hospice-hero' : ''))
        : ''
    )
    return (
      <HeroSection
        title={pickText(content.header || content.title || section.title || '', lang)}
        description={pickText(content.text || content.description || content.subtitle || '', lang)}
        imageUrl={content.imageUrl}
        imageAlt={pickText(content.imageAlt || '', lang)}
        variant={variant}
        contentPosition={content.contentPosition || content.imagePosition || 'left'}
        tone={tone}
        iconName={content.icon || content.iconName || undefined}
        buttonText={pickText(content.buttonText || '', lang)}
        buttonLink={content.buttonLink || '/schedule'}
        showOverlay={content.showOverlay !== undefined ? Boolean(content.showOverlay) : false}
        showLanguageSelector={Boolean(content.showLanguageSelector)}
        className={heroClassName}
        style={customStyles}
      />
    )
  }

  if (section.layout === 'LOCATION_MAPS' || (section.layout === 'MAP_SECTION' && content.useDynamicLocations)) {
    const mapTitle = pickText(content.header || content.title || section.title || '', lang)
    const directionsText = pickText(content.directionsText || '', lang) || undefined
    const hideHeading = content.hideHeading !== undefined ? Boolean(content.hideHeading) : true
    const fallback = (
      <MapSection
        config={section}
        content={{ ...content, hideHeading }}
        colors={colors}
        theme={theme}
        colorSource={colorSource}
        style={customStyles}
      />
    )
    return (
      <LocationMaps
        fallback={fallback}
        mapTitle={mapTitle}
        directionsText={directionsText}
        hideHeading={hideHeading}
        style={customStyles}
      />
    )
  }

  if (section.layout === 'HEADER_CARDS') {
    return (
      <HeaderCardsSection
        title={pickText(content.header || content.title || section.title || '', lang)}
        subtitle={pickText(content.text || content.subtitle || '', lang)}
        label={pickText(content.label || '', lang)}
        items={resolveSectionItems(content, lang, false, theme, colorSource)}
        backgroundImageUrl={content.imageUrl || content.backgroundImageUrl || undefined}
        headerPosition={content.headerPosition || content.imagePosition || 'left'}
        surface={content.surface || undefined}
        style={customStyles}
      />
    )
  }

  if (section.layout === 'HEADER_STACK') {
    return (
      <HeaderStackSection
        title={pickText(content.header || content.title || section.title || '', lang)}
        subtitle={pickText(content.text || content.subtitle || '', lang)}
        label={pickText(content.label || '', lang)}
        items={resolveSectionItems(content, lang, false, theme, colorSource)}
        columns={Number(content.gridCols || content.columns || 1)}
        style={customStyles}
      />
    )
  }

  if (section.layout === 'TIMELINE_SECTION') {
    return (
      <TimelineSection
        title={pickText(content.header || content.title || section.title || '', lang)}
        subtitle={pickText(content.text || content.subtitle || '', lang)}
        label={pickText(content.label || '', lang)}
        items={resolveSectionItems(content, lang, true, theme, colorSource)}
        style={customStyles}
      />
    )
  }

  if (section.layout === 'PAGE_CTA') {
    const hasPrimary = content.buttonText !== undefined || content.primaryLabel !== undefined
    const hasHome = content.secondaryButtonText !== undefined || content.homeLabel !== undefined
    return (
      <PageCallToAction
        title={pickText(content.header || content.title || section.title || '', lang)}
        description={pickText(content.text || content.description || content.subtitle || '', lang)}
        primaryLabel={hasPrimary ? pickText(content.buttonText ?? content.primaryLabel ?? '', lang) : 'Schedule a Consultation'}
        primaryLink={content.buttonLink || content.primaryLink || '/schedule'}
        homeLabel={hasHome ? pickText(content.secondaryButtonText ?? content.homeLabel ?? '', lang) : 'Back to Welcome'}
        homeLink={content.secondaryButtonLink || content.homeLink || '/welcome'}
        style={customStyles}
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
