// DT-622 DT-625 Sprint 8
// Preston Ball
// Modular header paragraph card component supporting rich body text, bullet formatting, and custom typography

import '../../../styles/components/modular/cards/HeaderParagraphCard.css'
import CardBody from './CardBase'
// DT-893: shared formatting rules (untouched defaults ignored, bold can be turned off)
import { typographyStyle } from '../typographyStyle'

export default function HeaderParagraphCard ({
  header,
  paragraph,
  alignment = 'left',
  typography = {},
  style = {}
}) {
  const alignClass = `card--align-${alignment || 'left'}`
  const headerTypo = typography.header || {}
  const textTypo = typography.paragraph || typography.text || {}

  const headerStyle = typographyStyle(headerTypo)
  const textStyle = typographyStyle(textTypo)

  return (
    <article className={`card--text ${alignClass}`} style={style}>
      {header && <h3 style={headerStyle}>{header}</h3>}
      {paragraph && (
        <div style={textStyle}>
          <CardBody text={paragraph} />
        </div>
      )}
    </article>
  )
}