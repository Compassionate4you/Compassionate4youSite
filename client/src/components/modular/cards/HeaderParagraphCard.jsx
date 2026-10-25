// DT-622 Sprint 8
// Preston Ball
// Modular header paragraph card component supporting rich body text and bullet formatting

import React from 'react'
import CardBody from '../CardBody'
import '../../../styles/components/modular/cards/HeaderParagraphCard.css'

export default function HeaderParagraphCard ({
  header,
  paragraph,
  alignment = 'left',
  style = {}
}) {
  const alignClass = `card--align-${alignment || 'left'}`

  return (
    <article className={`card--text ${alignClass}`} style={style}>
      {header && <h3>{header}</h3>}
      {paragraph && <CardBody text={paragraph} />}
    </article>
  )
}
