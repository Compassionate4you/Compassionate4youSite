import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ContentPage from '../ContentPage'
import { PageStorageService } from '../../services/pageStorageService'
import { SectionStorageService } from '../../services/sectionStorageService'
import en from '../../locales/en/translation.json'

// DT-902: Exercise theme propagation without depending on the app-level provider.
vi.mock('../../context/AccessibilityContext', () => ({ useAccessibility: () => ({ theme: 'dark' }) }))

vi.unmock('react-i18next')
vi.mock('../../services/pageStorageService', () => ({
  PageStorageService: {
    getPages: vi.fn(), loadFromDatabase: async () => [], subscribe: () => () => {}
  }
}))
vi.mock('../../services/sectionStorageService', () => ({
  SectionStorageService: {
    getSectionById: vi.fn(), loadFromDatabase: async () => []
  }
}))
vi.mock('../../services/cardStorageService', () => ({ CardStorageService: { loadFromDatabase: async () => [] } }))
vi.mock('../../services/colorConfigService', () => ({ ColorConfigService: { loadFromDatabase: async () => [], getColorById: () => null } }))

// DT-902: Render the real ContentPage and Welcome adapter instead of bypassing route selection.
async function show (route) {
  const i18n = createInstance()
  await i18n.use(initReactI18next).init({ resources: { en: { translation: en } }, lng: 'en' })
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[`/${route}`]}>
        <Routes><Route path='/:pageId' element={<ContentPage />} /></Routes>
      </MemoryRouter>
    </I18nextProvider>
  )
}

// DT-902: Lock Welcome alias fallback, both hero IDs, and exact-record precedence.
describe('Welcome ContentPage integration', () => {
  beforeEach(() => {
    SectionStorageService.getSectionById.mockImplementation(id => ({ id, layout: 'IMAGE_HEADER_TEXT', content: { header: 'Old hero', imageUrl: '/broken.jpg', buttonText: 'Schedule' } }))
  })

  it.each(['welcome', 'landing', 'home'])('renders the real Welcome hero on /%s with only a landing record', async route => {
    PageStorageService.getPages.mockReturnValue([{ id: 'landing', content: { title: 'Home', sectionIds: ['sec-landing-hero'] } }])
    const { container } = await show(route)
    expect(await screen.findByRole('heading', { name: en.landing.heroTitle })).toBeVisible()
    expect(container.querySelector('.c4-welcome-hero')).toBeInTheDocument()
    expect(document.title).toBe('Welcome | Compassionate Care')
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(screen.queryByRole('heading', { name: 'Home' })).toBeNull()
    expect(screen.getByRole('img', { name: en.landing.heroImageAlt }).getAttribute('src')).toContain('CareImage1')
    expect(screen.getByRole('combobox', { name: 'Language' })).toBeVisible()
    expect(screen.queryByRole('link', { name: /Schedule/ })).toBeNull()
    expect(screen.queryByText('Old hero')).toBeNull()
  })

  it.each(['welcome', 'landing', 'home'])('falls back to a renamed welcome record on /%s and supports the cache hero', async route => {
    PageStorageService.getPages.mockReturnValue([{ id: 'welcome', content: { title: 'Home', sectionIds: ['sec-hero'] } }])
    await show(route)
    expect(await screen.findByRole('heading', { name: en.landing.heroTitle })).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Language' })).toBeVisible()
  })

  it('prefers the requested welcome record over an existing landing record', async () => {
    PageStorageService.getPages.mockReturnValue([
      { id: 'landing', content: { title: 'Wrong record', sectionIds: ['landing-only'] } },
      { id: 'welcome', content: { title: 'Home', sectionIds: ['sec-landing-hero'] } }
    ])
    await show('welcome')
    expect(await screen.findByRole('heading', { name: en.landing.heroTitle })).toBeVisible()
    expect(SectionStorageService.getSectionById).toHaveBeenCalledWith('sec-landing-hero')
    expect(SectionStorageService.getSectionById).not.toHaveBeenCalledWith('landing-only')
  })
})
