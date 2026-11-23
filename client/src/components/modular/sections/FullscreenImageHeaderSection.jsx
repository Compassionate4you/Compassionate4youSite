// DT-622 Sprint 8
// Preston Ball
// Modular fullscreen image header hero layout with backdrop overlay and action button

import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { pickText } from '../cards/CardBase'
import resolveImageUrl from '../resolveImageUrl'
import '../../../styles/components/modular/sections/FullscreenImageHeaderSection.css'

export default function FullscreenImageHeaderSection ({
  config,
  content = {},
  style = {}
}) {
  const { i18n } = useTranslation()
  const lang = i18n.language || 'en'
  const data = content || config?.content || {}
  const header = pickText(data.header || data.title || config?.title || '', lang)
  const text = pickText(data.text || data.subtitle || data.description || '', lang)
  const imageUrl = resolveImageUrl(data.imageUrl || '/assets/images/CareImage1.jpeg')
  const buttonText = pickText(data.buttonText || '', lang)
  const buttonLink = data.buttonLink || '/schedule'
  const icon = data.icon || ''

  const backgroundStyle = {
    ...style,
    ...(imageUrl ? { backgroundImage: `url(${imageUrl})` } : {})
  }

  return (
    <section className="modular-fullscreen-header-section" style={backgroundStyle}>
      <div className="modular-fullscreen-header-section__overlay" />
      <div className="modular-fullscreen-header-section__inner">
        {icon && (
          <div className="modular-fullscreen-header-section__icon" aria-hidden="true">
            {icon}
          </div>
        )}
        {header && (
          <h1 className="modular-fullscreen-header-section__title">
            {header}
          </h1>
        )}
        {text && (
          <p className="modular-fullscreen-header-section__text">
            {text}
          </p>
        )}
        {buttonText && (
          buttonLink.startsWith('http') ? (
            <a
              href={buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="modular-fullscreen-header-section__cta"
            >
              {buttonText}
            </a>
          ) : (
            <Link
              to={buttonLink}
              className="modular-fullscreen-header-section__cta"
            >
              {buttonText}
            </Link>
          )
        )}
      </div>
    </section>
  )
}
