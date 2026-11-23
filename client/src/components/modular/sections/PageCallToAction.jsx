import { Link } from 'react-router-dom'
import SectionHeading, { useSectionTitleId } from './SectionHeading'
import '../../../styles/components/modular/sections/SectionShared.css'

// DT-902: Restore reference closing copy and translated scheduling/Welcome actions.
export default function PageCallToAction ({
  title,
  description,
  primaryLabel,
  primaryLink = '/schedule',
  homeLabel,
  homeLink = '/welcome',
  style = {}
}) {
  const titleId = useSectionTitleId(title)
  const renderLink = (to, label) => {
    if (!label) return null
    return String(to || '').startsWith('http')
      ? <a href={to} target='_blank' rel='noopener noreferrer'>{label}</a>
      : <Link to={to || '/'}>{label}</Link>
  }
  return (
    <section className='c4-section c4-page-cta' aria-labelledby={titleId} style={style}>
      <div className='c4-section__inner'>
        <SectionHeading id={titleId} title={title} subtitle={description} />
        {primaryLabel && <p>{renderLink(primaryLink, primaryLabel)}</p>}
        {homeLabel && <p>{renderLink(homeLink, homeLabel)}</p>}
      </div>
    </section>
  )
}
