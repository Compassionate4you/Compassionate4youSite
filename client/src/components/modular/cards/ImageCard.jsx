// DT-622 Sprint 8
// Preston Ball
// Modular image card component supporting split media alignment and responsive layout

import '../../../styles/components/modular/cards/ImageCard.css'
import CardBody from './CardBase'
// DT-893: shared formatting rules (untouched defaults ignored, bold can be turned off)
import { typographyStyle } from '../typographyStyle'

export default function ImageCard ({
  header,
  paragraph,
  imageUrl,
  imageAlt = '',
  alignment = 'left',
  typography = {},
  style = {}
}) {
  const alignClass = alignment === 'right' ? 'card--image-right' : 'card--image-left'
  const headerTypo = typography.header || {}
  const textTypo = typography.paragraph || typography.text || {}

  const headerStyle = typographyStyle(headerTypo)
  const textStyle = typographyStyle(textTypo)

  return (
    <article className={`card--image ${alignClass}`} style={style}>
      {imageUrl && (
        <img
          className="card__image"
          src={imageUrl}
          alt={imageAlt || header || ''}
          loading="lazy"
        />
      )}
      <div className="card__content">
        {header && <h3 style={headerStyle}>{header}</h3>}
        {paragraph && (
          <div style={textStyle}>
            <CardBody text={paragraph} />
          </div>
        )}
      </div>
    </article>
  )
}
