import SectionHeading, { useSectionTitleId } from './SectionHeading'
import '../../../styles/section-layouts.css'

/** Items: { id, title, description }[]. Numbering always follows array order. */
export default function TimelineSection ({ title, subtitle, label, items = [] }) {
  const titleId = useSectionTitleId(title)

  return (
    <section className='c4-section c4-timeline' aria-labelledby={titleId}>
      <div className='c4-section__inner'>
        <SectionHeading id={titleId} title={title} subtitle={subtitle} label={label} />
        <ol
          className={`c4-timeline__steps${items.length > 5 ? ' c4-timeline__steps--vertical' : ''}`}
          style={{ '--c4-step-count': Math.max(items.length, 1) }}
        >
          {items.map((item, index) => (
            <li className='c4-timeline__step' key={item.id}>
              <span className='c4-timeline__number' aria-hidden='true'>{index + 1}</span>
              {item.title && <h3 className='c4-timeline__step-title'>{item.title}</h3>}
              {item.description && <p className='c4-section__description'>{item.description}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
