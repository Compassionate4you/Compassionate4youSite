// DT-894 DT-917 DT-918 DT-921 Sprint 9
// PBall
// Dynamic Content Page displaying client-created pages and sections with dark/light theme synchronization

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PageStorageService } from '../services/pageStorageService'
import { SectionStorageService } from '../services/sectionStorageService'
import { CardStorageService } from '../services/cardStorageService'
import DynamicSectionRenderer from '../components/modular/DynamicSectionRenderer'
import HospiceSections from '../components/modular/HospiceSections'
import HomeHealthSections from '../components/modular/HomeHealthSections'
import WelcomeSections from '../components/modular/WelcomeSections'
import NotFoundPage from './NotFoundPage'
import '../styles/contentpage.css'
import { useTranslation } from 'react-i18next'
import { useAccessibility } from '../context/AccessibilityContext'
import { getContentPageLabel } from '../services/contentPageLabels'

// DT-732: Route Hospice sections through the new stack/cards presentation adapter.
// DT-731: Route Home Health sections through translated screenshot layouts.
// DT-902: Use the reference-content adapters without duplicate page/hero headings.
export default function ContentPage ({ defaultPageId }) {
  // DT-902: Share the active theme and translated page title with all section renderers.
  const { theme } = useAccessibility()
  const { t } = useTranslation()
  const params = useParams()
  const rawPageId = params.pageId || defaultPageId || 'landing'

  // DT-622 Sprint 8 - Preston Ball: Normalize aliases (e.g., home-health to homeHealth)
  // DT-902: The application opens /welcome; all Welcome aliases use the same presentation.
  const normalizedPageId = ['welcome', 'landing', 'home'].includes(rawPageId)
    ? 'landing'
    : (rawPageId === 'home-health' ? 'homeHealth' : rawPageId)

  const [pages, setPages] = useState(PageStorageService.getPages())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadData () {
      try {
        await Promise.all([
          PageStorageService.loadFromDatabase(),
          SectionStorageService.loadFromDatabase(),
          CardStorageService.loadFromDatabase()
        ])
      } catch (err) {
        console.error('Error loading content page data:', err)
      } finally {
        if (isMounted) {
          setPages(PageStorageService.getPages())
          setLoading(false)
        }
      }
    }

    loadData()

    const unsubscribe = PageStorageService.subscribe((updated) => {
      if (isMounted) setPages(updated)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [normalizedPageId])

  // DT-902: Prefer the requested CMS record before falling back to a compatible Welcome alias.
  const pageCandidates = normalizedPageId === 'landing'
    ? [rawPageId, 'landing', 'welcome', 'home']
    : [rawPageId, normalizedPageId]
  const currentPage = pageCandidates.map(id => pages.find(page => page.id === id)).find(Boolean)

  useEffect(() => {
    if (currentPage?.content?.title) {
      document.title = `${getContentPageLabel(currentPage, t)} | Compassionate Care`
    }
  }, [currentPage, t])

  // DT-902: Loading text follows the global palette.
  if (loading) {
    return (
      <main id="main-content" className="content-page" data-theme={theme} style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-muted-text)', fontSize: '1.1rem' }}>Loading content...</p>
      </main>
    )
  }

  if (!currentPage) {
    return <NotFoundPage />
  }

  const sectionIds = currentPage.content?.sectionIds || []
  const resolvedSections = sectionIds
    .map((secId) => SectionStorageService.getSectionById(secId))
    .filter(Boolean)

  // DT-731: Reuse normalized page IDs so /home-health selects the Home Health adapter.
  const PageSections = normalizedPageId === 'homeHealth'
    ? HomeHealthSections
    : (normalizedPageId === 'hospice' ? HospiceSections : (normalizedPageId === 'landing' ? WelcomeSections : null))

  return (
    <main id="main-content" className={`content-page${PageSections ? ' content-page--standard' : ''}`} data-theme={theme}>
      {/* DT-622 Sprint 8 - Preston Ball: Render page header if not landing */}
      {!PageSections && normalizedPageId !== 'landing' && (
        <div className="content-page-hero">
          <h1>{currentPage.content?.title || currentPage.id}</h1>
        </div>
      )}

      {/* DT-918 Sprint 9 - PBall: Render configured modular sections with active accessibility theme */}
      <div className="content-page-sections">
        {resolvedSections.length > 0 ? (
          PageSections ? <PageSections sections={resolvedSections} theme={theme} /> : resolvedSections.map((sec) => (
            <DynamicSectionRenderer
              key={sec.id}
              config={sec}
              theme={theme}
            />
          ))
        ) : (
          <div className="content-page-empty">
            <h2>{currentPage.content?.title || currentPage.id}</h2>
            <p>This content page currently has no assigned sections configured in the Content Editor.</p>
          </div>
        )}
      </div>
    </main>
  )
}
