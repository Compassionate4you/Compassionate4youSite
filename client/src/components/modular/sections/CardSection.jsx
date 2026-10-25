// DT-622 Sprint 8
// Preston Ball
// Modular card section layout loading cards from database via CardStorageService

import React from 'react'
import { useTranslation } from 'react-i18next'
import ModularCard from '../cards/ModularCard'
import { CardStorageService } from '../../../services/cardStorageService'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { pickText } from '../cardText'
import '../../../styles/components/modular/sections/CardSection.css'

export default function CardSection ({
  config,
  content = {},
  theme = 'light',
  slug,
  sectionId,
  className = '',
  style = {}
}) {
  const { i18n } = useTranslation()

  // Resolve section data from props or storage by slug/ID
  const targetId = slug || sectionId || config?.id
  const storedSection = targetId ? SectionStorageService.getSectionById(targetId) : null
  const activeConfig = config || storedSection || {}
  const data = content && Object.keys(content).length > 0
    ? content
    : (activeConfig.content || {})

  const rawTitle = data.header || data.title || activeConfig.title || ''
  const title = pickText(rawTitle, i18n.language)

  // Resolve card list from content.cardIds, fallback to embedded cards
  const cardIds = data.cardIds || []
  let resolvedCards = []

  if (Array.isArray(cardIds) && cardIds.length > 0) {
    resolvedCards = cardIds
      .map((id) => CardStorageService.getCardById(id))
      .filter(Boolean)
  }

  if (resolvedCards.length === 0 && Array.isArray(data.cards || activeConfig.cards)) {
    resolvedCards = data.cards || activeConfig.cards
  }

  // If no cards exist for this section, omit rendering
  if (!resolvedCards || resolvedCards.length === 0) {
    return null
  }

  const columns = Number(data.gridCols || data.columns || 3)
  const sectionClassName = ['card-section', className].filter(Boolean).join(' ')

  return (
    <section className={sectionClassName} style={style} aria-label={title || undefined}>
      {title && <h2 className="card-section__title">{title}</h2>}
      <div className="card-grid" style={{ '--card-columns': Math.min(Math.max(columns, 1), 4) }}>
        {resolvedCards.map((card, index) => (
          <ModularCard
            key={card.id || `card-${index}`}
            card={card}
            theme={theme}
          />
        ))}
      </div>
    </section>
  )
}
