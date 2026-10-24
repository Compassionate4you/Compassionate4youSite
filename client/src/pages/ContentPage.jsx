// DT-622 Sprint 8
// Preston Ball
// Dynamic Content Page displaying client-created pages and sections from the database

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PageStorageService } from '../services/pageStorageService'
import { SectionStorageService } from '../services/sectionStorageService'
import { CardStorageService } from '../services/cardStorageService'
import { ColorConfigService } from '../services/colorConfigService'
import DynamicSectionRenderer from '../components/modular/DynamicSectionRenderer'
import NotFoundPage from './NotFoundPage'
import '../styles/contentpage.css'

export default function ContentPage ({ defaultPageId }) {
  const params = useParams()
  const rawPageId = params.pageId || defaultPageId || 'landing'

  // DT-622 Sprint 8 - Preston Ball: Normalize aliases (e.g., home-health to homeHealth)
  const normalizedPageId = rawPageId === 'home-health' ? 'homeHealth' : rawPageId

  const [pages, setPages] = useState(PageStorageService.getPages())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadData () {
      try {
        await Promise.all([
          PageStorageService.loadFromDatabase(),
          SectionStorageService.loadFromDatabase(),
          CardStorageService.loadFromDatabase(),
          ColorConfigService.loadFromDatabase()
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

  const currentPage = pages.find((p) => p.id === normalizedPageId || p.id === rawPageId)

  useEffect(() => {
    if (currentPage?.content?.title) {
      document.title = `${currentPage.content.title} | Compassionate Care`
    }
  }, [currentPage])

  if (loading) {
    return (
      <main id="main-content" className="content-page" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading content...</p>
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

  return (
    <main id="main-content" className="content-page">
      {/* DT-622 Sprint 8 - Preston Ball: Render page header if not landing */}
      {normalizedPageId !== 'landing' && (
        <div className="content-page-hero">
          <h1>{currentPage.content?.title || currentPage.id}</h1>
        </div>
      )}

      {/* DT-622 Sprint 8 - Preston Ball: Render all configured modular sections */}
      <div className="content-page-sections">
        {resolvedSections.length > 0 ? (
          resolvedSections.map((sec) => (
            <DynamicSectionRenderer
              key={sec.id}
              config={sec}
              theme="light"
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
