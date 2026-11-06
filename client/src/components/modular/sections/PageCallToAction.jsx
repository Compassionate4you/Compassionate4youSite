import { Link } from 'react-router-dom'
import SectionHeading, { useSectionTitleId } from './SectionHeading'
import '../../../styles/components/modular/sections/SectionShared.css'

// DT-902: Restore reference closing copy and translated scheduling/Welcome actions.
export default function PageCallToAction ({ title, description, primaryLabel, homeLabel }) {
  const titleId = useSectionTitleId(title)
  return (
    <section className='c4-section' aria-labelledby={titleId}>
      <div className='c4-section__inner'>
        <SectionHeading id={titleId} title={title} subtitle={description} />
        <p><Link to='/schedule'>{primaryLabel}</Link></p>
        <p><Link to='/welcome'>{homeLabel}</Link></p>
      </div>
    </section>
  )
}
