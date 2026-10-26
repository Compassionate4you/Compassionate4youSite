// DT-622 DT-625 Sprint 8
// Preston Ball
// Modular section layout displaying hero image, section title, body description, and optional CTA button with left/right toggle

import React from 'react'
import { Link } from 'react-router-dom'
import '../../../styles/components/modular/sections/ImageHeaderTextSection.css'

export default function ImageHeaderTextSection ({
  config,
  content = {},
  style = {}
}) {
  const data = content || config?.content || {}
  const header = data.header || data.title || config?.title || ''
  const text = data.text || data.paragraph || ''
  const imageUrl = data.imageUrl || ''
  const imageAlt = data.imageAlt || header || 'Section image'
  const buttonText = data.buttonText || ''
  const buttonLink = data.buttonLink || ''
  // DT-625 Sprint 8 - Preston Ball: Support image on left or right
  const imagePosition = data.imagePosition || 'left'

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
    <section className="modular-image-header-text-section" style={style}>
      <div className={`modular-image-header-text-section__inner ${imagePosition === 'right' ? 'modular-image-header-text-section__inner--reverse' : ''}`}>
        {imageUrl && (
          <div className="modular-image-header-text-section__image-col">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="modular-image-header-text-section__img"
              loading="lazy"
            />
          </div>
        )}
        <div className="modular-image-header-text-section__content-col">
          {header && (
            <h2 className="modular-image-header-text-section__title" style={headerStyle}>
              {header}
            </h2>
          )}
          {text && (
            <p className="modular-image-header-text-section__text" style={textStyle}>
              {text}
            </p>
          )}
          {buttonText && buttonLink && (
            buttonLink.startsWith('http') ? (
              <a
                href={buttonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="modular-image-header-text-section__cta"
              >
                {buttonText}
              </a>
            ) : (
              <Link
                to={buttonLink}
                className="modular-image-header-text-section__cta"
              >
                {buttonText}
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  )
}
