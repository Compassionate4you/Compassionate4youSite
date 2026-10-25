import SectionHeading, { useSectionTitleId } from './SectionHeading'
import '../../../styles/section-layouts.css'

/** Items: { id, title, description }[]. columns: 1 (default) | 2. */
export default function HeaderStackSection ({ title, subtitle, label, items = [], columns = 1 }) {
  const titleId = useSectionTitleId(title)

  return (
    <section className='c4-section c4-header-stack' aria-labelledby={titleId}>
      <div className='c4-section__inner'>
        <SectionHeading id={titleId} title={title} subtitle={subtitle} label={label} />
        <div className={`c4-header-stack__grid${columns === 2 ? ' c4-header-stack__grid--two' : ''}`}>
          {items.map(item => (
            <article className='c4-header-stack__card' key={item.id}>
              {item.title && <h3 className='c4-header-stack__card-title'>{item.title}</h3>}
              {item.description && <p className='c4-section__description c4-header-stack__body'>{item.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
