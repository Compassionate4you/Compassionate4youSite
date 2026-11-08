import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { describe, expect, it, vi } from 'vitest'
import HomeHealthSections from '../../HomeHealthSections'
import english from '../../../../locales/en/translation.json'

vi.unmock('react-i18next')
vi.mock('../../DynamicSectionRenderer', () => ({
  default: ({ config, theme }) => <div data-testid={config.id} data-theme={theme}>Unchanged layout</div>
}))

// DT-731: Exercise every supported language using the same translation files as the site.
const localeFiles = import.meta.glob('../../../../locales/*/translation.json', { eager: true, import: 'default' })
const resources = Object.fromEntries(Object.entries(localeFiles).map(([path, translation]) => [
  path.split('/').at(-2), { translation }
]))
const serviceKeys = ['doctors', 'pt', 'ot', 'nurses', 'st', 'chha', 'msw', 'multilingual']
const sections = ['other', 'services', 'advantages', 'specialties', 'contact'].map(name => ({
  id: `sec-hh-${name}`,
  content: { header: 'Legacy CMS heading', cardIds: ['legacy-card'] }
}))

// DT-731: Mount the adapter with real i18n to validate live language changes.
async function show () {
  const i18n = createInstance()
  await i18n.use(initReactI18next).init({ resources, lng: 'en', fallbackLng: 'en', interpolation: { escapeValue: false } })
  const result = render(<I18nextProvider i18n={i18n}><MemoryRouter><HomeHealthSections sections={sections} theme='dark' /></MemoryRouter></I18nextProvider>)
  return { ...result, i18n }
}

// DT-731: Lock screenshot content, layout assignments, CMS preservation, and translation behavior.
describe('Home Health sections', () => {
  it('renders screenshot content through cards with the advantages heading on the right', async () => {
    const original = JSON.stringify(sections)
    const { container } = await show()
    const services = screen.getByRole('region', { name: 'Our Home Health Services' })
    const advantages = screen.getByRole('region', { name: 'Home Health Advantages' })
    const specialties = screen.getByRole('region', { name: 'Specialty Services' })
    expect(services).toHaveClass('c4-header-cards')
    expect(specialties).toHaveClass('c4-header-cards')
    expect(advantages).toHaveClass('c4-header-cards', 'c4-header-cards--right')
    expect(services).not.toHaveClass('c4-header-cards--right')
    expect(specialties).not.toHaveClass('c4-header-cards--right')
    expect(within(services).getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(serviceKeys.map(key => english.homeHealth.services[key]))
    expect(within(services).getAllByRole('listitem')).toHaveLength(8)
    expect(within(specialties).getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(english.homeHealthPage.specialties)
    expect(within(specialties).getAllByRole('listitem')).toHaveLength(10)
    expect([...advantages.querySelectorAll('.c4-section__description')].map(node => node.textContent)).toEqual(english.homeHealthPage.advantages)
    expect(within(advantages).getAllByRole('listitem')).toHaveLength(7)
    expect(within(advantages).queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
    expect(container.querySelectorAll('.c4-header-cards__icon .lucide-heart')).toHaveLength(25)
    expect(container.querySelector('.card-section, .card-grid, img, .c4-section__subtitle')).toBeNull()
    expect(container.querySelectorAll('h2')).toHaveLength(3)
    expect(screen.queryByText('Legacy CMS heading')).not.toBeInTheDocument()
    expect(screen.getByTestId('sec-hh-other')).toHaveAttribute('data-theme', 'dark')
    expect(screen.getByTestId('sec-hh-contact')).toBeInTheDocument()
    expect([...container.children].map(node => node.dataset.testid || node.querySelector('h2').textContent)).toEqual([
      'sec-hh-other', 'Our Home Health Services', 'Home Health Advantages', 'Specialty Services', 'sec-hh-contact'
    ])
    expect(JSON.stringify(sections)).toBe(original)
  })

  it('updates every heading and item when switching supported languages', async () => {
    const { i18n } = await show()
    for (const language of Object.keys(resources)) {
      await act(() => i18n.changeLanguage(language))
      const copy = resources[language].translation
      const pageCopy = copy.homeHealthPage || english.homeHealthPage
      const services = screen.getByRole('region', { name: copy.homeHealth.servicesHeading })
      const advantages = screen.getByRole('region', { name: pageCopy.advantagesTitle })
      const specialties = screen.getByRole('region', { name: pageCopy.specialtyTitle })
      expect(within(services).getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(serviceKeys.map(key => copy.homeHealth.services[key]))
      expect([...advantages.querySelectorAll('.c4-section__description')].map(node => node.textContent)).toEqual(pageCopy.advantages)
      expect(within(specialties).getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(pageCopy.specialties)
    }
  })
})
