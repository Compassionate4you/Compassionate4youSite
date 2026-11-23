import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ContentPage from '../ContentPage'

// DT-902: Exercise theme propagation without depending on the app-level provider.
vi.mock('../../context/AccessibilityContext', () => ({ useAccessibility: () => ({ theme: 'dark' }) }))

vi.mock('../../services/pageStorageService', () => ({
  PageStorageService: {
    getPages: () => ['homeHealth', 'hospice', 'landing', 'custom'].map(id => ({ id, content: { title: id, sectionIds: ['example'] } })),
    loadFromDatabase: async () => [],
    subscribe: () => () => {}
  }
}))
vi.mock('../../services/sectionStorageService', () => ({
  SectionStorageService: { getSectionById: id => ({ id }), loadFromDatabase: async () => [] }
}))
vi.mock('../../services/cardStorageService', () => ({ CardStorageService: { loadFromDatabase: async () => [] } }))
vi.mock('../../components/modular/DynamicSectionRenderer', () => ({ default: ({ theme }) => <div data-theme={theme}>Dynamic renderer</div> }))

// Confirm all page routes dispatch sections directly through DynamicSectionRenderer with active theme.
describe('ContentPage dynamic section routing', () => {
  it.each([
    'home-health',
    'homeHealth',
    'hospice',
    'landing',
    'welcome',
    'home',
    'custom'
  ])('routes %s through DynamicSectionRenderer', async (pageId) => {
    render(
      <MemoryRouter initialEntries={[`/${pageId}`]}>
        <Routes><Route path='/:pageId' element={<ContentPage />} /></Routes>
      </MemoryRouter>
    )
    expect(await screen.findByText('Dynamic renderer')).toHaveAttribute('data-theme', 'dark')
  })
})
