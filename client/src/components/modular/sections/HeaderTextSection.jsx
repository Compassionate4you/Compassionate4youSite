// DT-622 DT-625 Sprint 8
// Preston Ball
// Modular header text section component displaying editorial headings and rich text with typography support

import { useTranslation } from 'react-i18next'
import { pickText } from '../cards/CardBase'
import BannerSection, { getWelcomeBannerIcon } from './BannerSection'

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

  return (
    <div className='c4-welcome-banners'>
      <BannerSection
        title={header}
        description={text}
        Icon={getWelcomeBannerIcon(config?.slug, config?.id)}
        typography={typography}
        style={style}
      />
    </div>
  )
}
