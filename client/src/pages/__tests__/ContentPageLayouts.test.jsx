import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ContentPage from '../ContentPage'

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
vi.mock('../../services/colorConfigService', () => ({ ColorConfigService: { loadFromDatabase: async () => [] } }))
vi.mock('../../components/modular/HomeHealthSections', () => ({ default: () => <div>Home Health adapter</div> }))
vi.mock('../../components/modular/HospiceSections', () => ({ default: () => <div>Hospice adapter</div> }))
// DT-902: Welcome now has its own reference-content adapter.
vi.mock('../../components/modular/WelcomeSections', () => ({ default: () => <div>Welcome adapter</div> }))
vi.mock('../../components/modular/DynamicSectionRenderer', () => ({ default: () => <div>Default renderer</div> }))

// DT-731: Confirm page routing selects Home Health for both aliases and preserves other dispatch.
describe('ContentPage layout adapters', () => {
  it.each([
    ['home-health', 'Home Health adapter'],
    ['homeHealth', 'Home Health adapter'],
    ['hospice', 'Hospice adapter'],
    ['landing', 'Welcome adapter'],
    ['welcome', 'Welcome adapter'],
    ['home', 'Welcome adapter'],
    ['custom', 'Default renderer']
  ])('routes %s to %s', async (pageId, expected) => {
    render(
      <MemoryRouter initialEntries={[`/${pageId}`]}>
        <Routes><Route path='/:pageId' element={<ContentPage />} /></Routes>
      </MemoryRouter>
    )
    expect(await screen.findByText(expected)).toBeInTheDocument()
  })
})
