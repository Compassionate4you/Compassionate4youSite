import { useState } from 'react'
import SectionHeading, { useSectionTitleId } from './SectionHeading'
import SectionIcon from './SectionIcon'
// DT-902: Load the shared foundation and this layout's styles.
import '../../../styles/components/modular/sections/SectionShared.css'
import '../../../styles/components/modular/sections/HeaderCardsSection.css'

/**
 * Presentation only. Items: { id, title?, description, iconName?, listItems? }[].
 * headerPosition: 'left' (default) | 'right'; the header comes first on mobile.
 * Background images are decorative; all meaningful content belongs in text props.
 */
// DT-902: Allow selected sections to use the global white surface and matching text.
// DT-902: Preserve reference benefit lists as semantic lists beneath introductory copy.
export default function HeaderCardsSection ({
  title, subtitle, label, items = [], backgroundImageUrl, headerPosition = 'left', surface
}) {
  const titleId = useSectionTitleId(title)
  const [failedImage, setFailedImage] = useState(null)
  const hasBackground = Boolean(backgroundImageUrl && backgroundImageUrl !== failedImage)

  return (
    <section
      className={`c4-section c4-header-cards${surface === 'white' ? ' c4-header-cards--white' : ''}${headerPosition === 'right' ? ' c4-header-cards--right' : ''}${hasBackground ? ' c4-header-cards--image' : ''}`}
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
              {item.listItems?.length > 0 && (
                <ul className='c4-section__description'>
                  {item.listItems.map((text, index) => <li key={index}>{text}</li>)}
                </ul>
              )}
              <span className='c4-header-cards__number' aria-hidden='true'>{index + 1}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
