// DT-622 Sprint 8
// Preston Ball
// Modular section layout displaying hero image, section title, body description, and optional CTA button

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

  return (
    <section className="modular-image-header-text-section" style={style}>
      <div className="modular-image-header-text-section__inner">
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
            <h2 className="modular-image-header-text-section__title">
              {header}
            </h2>
          )}
          {text && (
            <p className="modular-image-header-text-section__text">
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
