// DT-875 DT-902 DT-622 DT-625 Sprint 9
// PBall
// Modular header text section component displaying editorial headings, decorative banner icons, and rich text with typography support

import { Heart, HeartHandshake, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { pickText } from '../cards/CardBase'
import BannerSection, { getWelcomeBannerIcon } from './BannerSection'

const BANNER_ICON_MAP = {
  Heart,
  HeartHandshake,
  Users
}

// DT-902: Render localized editable header/text content with the complete DT-861 banner.
export default function HeaderTextSection ({
  config,
  content,
  style = {}
}) {
  const { i18n } = useTranslation()
  const data = content || config?.content || {}
  const header = pickText(data.header || data.title || config?.title || '', i18n.language)
  const text = pickText(data.text || data.paragraph || '', i18n.language)

  // DT-625 Sprint 8 - Preston Ball: Resolve optional typography styles
  const typography = data.typography || {}
  // DT-875 Sprint 9 - PBall: Allow explicit icon selection from editor while preserving ID/slug fallback
  const customIcon = data.icon && BANNER_ICON_MAP[data.icon] ? BANNER_ICON_MAP[data.icon] : undefined
  const resolvedIcon = customIcon || getWelcomeBannerIcon(config?.slug, config?.id)

  return (
    <div className='c4-welcome-banners'>
      <BannerSection
        title={header}
        description={text}
        Icon={resolvedIcon}
        typography={typography}
        style={style}
        formatBody={Boolean(data.formatBody)}
      />
    </div>
  )
}
