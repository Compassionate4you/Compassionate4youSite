// DT-622 DT-625 Sprint 8
// Preston Ball
// Modular header text section component displaying editorial headings and rich text with typography support

import React from 'react'
import '../../../styles/components/modular/sections/HeaderTextSection.css'

export default function HeaderTextSection ({
  config,
  content = {},
  style = {}
}) {
  const data = content || config?.content || {}
  const header = data.header || data.title || config?.title || ''
  const text = data.text || data.paragraph || ''

  // DT-625 Sprint 8 - Preston Ball: Resolve optional typography styles
  const typography = data.typography || {}
  const headerTypography = typography.header || {}
  const textTypography = typography.text || {}

  const headerStyle = {
    textAlign: headerTypography.align || undefined,
    fontFamily: headerTypography.fontFamily && headerTypography.fontFamily !== 'inherit' ? headerTypography.fontFamily : undefined,
    fontWeight: headerTypography.bold ? 'bold' : undefined,
    fontStyle: headerTypography.italic ? 'italic' : undefined
  }

  const textStyle = {
    textAlign: textTypography.align || undefined,
    fontFamily: textTypography.fontFamily && textTypography.fontFamily !== 'inherit' ? textTypography.fontFamily : undefined,
    fontWeight: textTypography.bold ? 'bold' : undefined,
    fontStyle: textTypography.italic ? 'italic' : undefined
  }

  return (
    <section className="modular-header-text-section" style={style}>
      <div className="modular-header-text-section__inner">
        {header && (
          <h2 className="modular-header-text-section__title" style={headerStyle}>
            {header}
          </h2>
        )}
        {text && (
          <p className="modular-header-text-section__text" style={textStyle}>
            {text}
          </p>
        )}
      </div>
    </section>
  )
}
