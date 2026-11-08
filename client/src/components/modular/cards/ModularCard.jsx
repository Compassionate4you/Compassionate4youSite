// DT-622 Sprint 8
// Preston Ball
// Card interpreter dispatching layouts and resolving theme color tokens

import { useTranslation } from 'react-i18next'
import { pickText } from './CardBase'
import BannerSection from '../sections/BannerSection'
import ImageCard from './ImageCard'
import HeaderParagraphCard from './HeaderParagraphCard'
import HeaderSymbolCard from './HeaderSymbolCard'
import { ColorConfigService } from '../../../services/colorConfigService'

// DT-902: Welcome paragraph cards can render the shared banner without changing other layouts.
export default function ModularCard ({ card, theme = 'light', colorSource = 'cms', BannerIcon }) {
  const { i18n } = useTranslation()
  if (!card) return null

  const content = card.content || {}
  const colors = content.colors || card.colors || {}
  const lang = i18n.language

  const resolveColor = (colorId, fallback) => {
    if (!colorId) return fallback
    const c = ColorConfigService.getColorById(colorId)
    if (!c) return fallback
    return theme === 'dark' ? c.darkModeColor : c.lightModeColor
  }

  // DT-902: Global mode ignores stored card colours without changing CMS defaults.
  const customStyles = colorSource === 'global'
    ? {
        '--card-bg': 'var(--color-white)',
        '--card-header': 'var(--color-white-text)',
        '--card-text': 'var(--color-white-text)'
      }
    : {
        '--card-bg': resolveColor(colors.backgroundColor, theme === 'dark' ? '#1e293b' : '#ffffff'),
        '--card-header': resolveColor(colors.headerColor, theme === 'dark' ? '#f8fafc' : '#0f172a'),
        '--card-text': resolveColor(colors.textColor, theme === 'dark' ? '#cbd5e1' : '#334155')
      }

  const commonProps = {
    header: pickText(content.header ?? card.header, lang),
    paragraph: pickText(content.paragraph || content.text || card.paragraph, lang),
    imageUrl: content.imageUrl ?? card.imageUrl,
    imageAlt: pickText(content.imageAlt ?? card.imageAlt, lang),
    symbol: content.symbol || content.iconName || card.symbol,
    alignment: content.alignment || content.facing || card.alignment || 'left',
    // DT-625 Sprint 8 - Preston Ball: Forward typography configuration to cards
    typography: content.typography || card.typography || {},
    style: customStyles
  }

  const layout = card.layout || card.layoutType || 'HEADER_PARAGRAPH'

  // DT-902: Restrict banners to paragraph cards within recognized Welcome sections.
  if (BannerIcon && ['HEADER_PARAGRAPH', 'HEADER_TEXT_BOX'].includes(layout)) {
    return (
      <BannerSection
        title={commonProps.header}
        description={commonProps.paragraph}
        Icon={BannerIcon}
        typography={commonProps.typography}
        style={commonProps.style}
        formatBody
      />
    )
  }

  switch (layout) {
    case 'IMAGE_FULL_WIDTH':
    case 'IMAGE_CARD':
    case 'FULL_WIDTH_SPLIT':
      return <ImageCard {...commonProps} />
    case 'HEADER_SYMBOL':
    case 'HEADER_VECTOR_GRAPHIC':
      return <HeaderSymbolCard {...commonProps} />
    case 'HEADER_PARAGRAPH':
    case 'HEADER_TEXT_BOX':
    default:
      return <HeaderParagraphCard {...commonProps} />
  }
}
