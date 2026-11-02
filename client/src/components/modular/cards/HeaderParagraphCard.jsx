// DT-622 DT-625 Sprint 8
// Preston Ball
// Modular header paragraph card component supporting rich body text, bullet formatting, and custom typography

import '../../../styles/components/modular/cards/HeaderParagraphCard.css'
import CardBody from './CardBase'

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