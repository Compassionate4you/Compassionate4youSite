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
  typography = {},
  style = {}
}) {
  const alignClass = alignment === 'right' ? 'card--image-right' : 'card--image-left'
  const headerTypo = typography.header || {}
  const textTypo = typography.paragraph || typography.text || {}

  const headerStyle = {
    textAlign: headerTypo.align || undefined,
    fontFamily: headerTypo.fontFamily && headerTypo.fontFamily !== 'inherit' ? headerTypo.fontFamily : undefined,
    fontWeight: headerTypo.bold ? 'bold' : undefined,
    fontStyle: headerTypo.italic ? 'italic' : undefined
  }
  const textStyle = {
    textAlign: textTypo.align || undefined,
    fontFamily: textTypo.fontFamily && textTypo.fontFamily !== 'inherit' ? textTypo.fontFamily : undefined,
    fontWeight: textTypo.bold ? 'bold' : undefined,
    fontStyle: textTypo.italic ? 'italic' : undefined
  }

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
