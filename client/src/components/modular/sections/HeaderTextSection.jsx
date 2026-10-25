// DT-622 Sprint 8
// Preston Ball
// Modular header text section component displaying editorial headings and rich text

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

  return (
    <section className="modular-header-text-section" style={style}>
      <div className="modular-header-text-section__inner">
        {header && (
          <h2 className="modular-header-text-section__title">
            {header}
          </h2>
        )}
        {text && (
          <p className="modular-header-text-section__text">
            {text}
          </p>
        )}
      </div>
    </section>
  )
}
