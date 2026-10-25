// DT-622 Sprint 8
// Preston Ball
// Modular image card component supporting split media alignment and responsive layout

import React from 'react'
import CardBody from '../CardBody'
import '../../../styles/components/modular/cards/ImageCard.css'

export default function ImageCard ({
  header,
  paragraph,
  imageUrl,
  imageAlt = '',
  alignment = 'left',
  style = {}
}) {
  const alignClass = alignment === 'right' ? 'card--image-right' : 'card--image-left'

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
        {header && <h3>{header}</h3>}
        {paragraph && <CardBody text={paragraph} />}
      </div>
    </article>
  )
}
