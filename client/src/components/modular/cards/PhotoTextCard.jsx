import { useId } from 'react'
import CardBody from './CardBase'
import resolveImageUrl from '../resolveImageUrl'
import '../../../styles/components/modular/cards/PhotoTextCard.css'

// DT-902: Bordered photo/text card with alternating imagery and formatted translated copy.
export default function PhotoTextCard ({ header, paragraph, imageUrl, imageAlt = '', imagePosition = 'left' }) {
  const titleId = useId()
  return (
    <article className={`c4-photo-card${imagePosition === 'right' ? ' c4-photo-card--right' : ''}${imageUrl ? '' : ' c4-photo-card--text-only'}`} aria-labelledby={header ? titleId : undefined}>
      {imageUrl && <img className='c4-photo-card__image' src={resolveImageUrl(imageUrl)} alt={imageAlt || header || ''} loading='lazy' />}
      <div className='c4-photo-card__content' dir='auto'>
        {header && <h3 id={titleId} className='c4-photo-card__title'>{header}</h3>}
        {paragraph && <div className='c4-photo-card__body'><CardBody text={paragraph} /></div>}
      </div>
    </article>
  )
}
