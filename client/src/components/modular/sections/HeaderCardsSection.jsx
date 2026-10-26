import { useState } from 'react'
import SectionHeading, { useSectionTitleId } from './SectionHeading'
import SectionIcon from './SectionIcon'
import '../../../styles/section-layouts.css'

/**
 * Presentation only. Items: { id, title?, description, iconName? }[].
 * headerPosition: 'left' (default) | 'right'; the header comes first on mobile.
 * Background images are decorative; all meaningful content belongs in text props.
 */
export default function HeaderCardsSection ({
  title, subtitle, label, items = [], backgroundImageUrl, headerPosition = 'left'
}) {
  const titleId = useSectionTitleId(title)
  const [failedImage, setFailedImage] = useState(null)
  const hasBackground = Boolean(backgroundImageUrl && backgroundImageUrl !== failedImage)

  return (
    <section
      className={`c4-section c4-header-cards${headerPosition === 'right' ? ' c4-header-cards--right' : ''}${hasBackground ? ' c4-header-cards--image' : ''}`}
      aria-labelledby={titleId}
    >
      {hasBackground && (
        <img
          className='c4-header-cards__background'
          src={backgroundImageUrl}
          alt=''
          onError={() => setFailedImage(backgroundImageUrl)}
        />
      )}
      <div className='c4-section__inner c4-header-cards__inner'>
        <SectionHeading id={titleId} title={title} subtitle={subtitle} label={label} />
        <ol className='c4-header-cards__grid'>
          {items.map((item, index) => (
            <li className='c4-header-cards__card' key={item.id}>
              <span className='c4-header-cards__icon'><SectionIcon name={item.iconName} /></span>
              {item.title && <h3 className='c4-header-cards__card-title'>{item.title}</h3>}
              {item.description && <p className='c4-section__description'>{item.description}</p>}
              <span className='c4-header-cards__number' aria-hidden='true'>{index + 1}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
