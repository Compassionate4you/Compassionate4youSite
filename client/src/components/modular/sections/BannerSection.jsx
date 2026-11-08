import { useId } from 'react'
import { Heart, HeartHandshake, Users } from 'lucide-react'
import CardBody from '../cards/CardBase'
import '../../../styles/components/modular/sections/BannerSection.css'

// DT-902: Resolve decorative Welcome icons from stable section identifiers.
const welcomeIcons = {
  'welcome-philosophy': Heart,
  'welcome-caring-since': HeartHandshake,
  'welcome-about': Users
}

// DT-902: Share icon selection between section and card renderers without matching translated copy.
export function getWelcomeBannerIcon (...identifiers) {
  return identifiers.map(id => Object.hasOwn(welcomeIcons, id) ? welcomeIcons[id] : undefined).find(Boolean)
}

// DT-902 / DT-625: Preserve editable typography over the banner's default centered styles.
function typographyStyle (typography = {}) {
  return {
    textAlign: typography.align || undefined,
    fontFamily: typography.fontFamily && typography.fontFamily !== 'inherit' ? typography.fontFamily : undefined,
    fontWeight: typography.bold ? 'bold' : undefined,
    fontStyle: typography.italic ? 'italic' : undefined
  }
}

// DT-902: Shared full DT-861 banner, including accessible headings and decorative icon dividers.
export default function BannerSection ({
  title, description, Icon = Heart, typography = {}, style = {}, formatBody = false
}) {
  const titleId = useId()
  return (
    <section className='c4-welcome-banner' style={style} aria-labelledby={title ? titleId : undefined}>
      <div className='c4-welcome-banner__ornament' aria-hidden='true'>
        <span className='c4-welcome-banner__badge'>
          <Icon focusable='false' strokeWidth={1.6} />
        </span>
      </div>
      {title && <h2 className='c4-welcome-banner__title' id={titleId} style={typographyStyle(typography.header)}>{title}</h2>}
      {description && (formatBody
        ? <div className='c4-welcome-banner__description' style={typographyStyle(typography.paragraph || typography.text)}><CardBody text={description} /></div>
        : <p className='c4-welcome-banner__description' style={typographyStyle(typography.text)}>{description}</p>)}
    </section>
  )
}
