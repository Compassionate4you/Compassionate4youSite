import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { describe, expect, it, vi } from 'vitest'
import HospiceSections from '../../HospiceSections'
import en from '../../../../locales/en/translation.json'
import es from '../../../../locales/es/translation.json'

vi.unmock('react-i18next')
vi.mock('../../DynamicSectionRenderer', () => ({ default: ({ config }) => <div data-testid={config.id}>Other layout</div> }))

// DT-902: Exercise the restored reference sections with real translated content.
const sections = ['understanding', 'benefits', 'comprehensive', 'above-beyond', 'process', 'other'].map(name => ({ id: `sec-hospice-${name}` }))

// DT-732: Retain layout coverage for Hospice cards, stacks, and timeline.
// DT-902: Verify restored counts, semantic lists, independent support services, and language switching.
describe('Hospice reference sections', () => {
  it('renders all reference sections independently without changing CMS configuration', async () => {
    const original = JSON.stringify(sections)
    const i18n = createInstance()
    await i18n.use(initReactI18next).init({ resources: { en: { translation: en }, es: { translation: es } }, lng: 'en', fallbackLng: 'en' })
    const { container } = render(<I18nextProvider i18n={i18n}><MemoryRouter><HospiceSections sections={sections} /></MemoryRouter></I18nextProvider>)
    expect(within(screen.getByRole('region', { name: 'Understanding Hospice Care' })).getAllByRole('article')).toHaveLength(5)
    const benefits = screen.getByRole('region', { name: 'Hospice Care Team & Benefits' })
    const support = screen.getByRole('region', { name: 'Comprehensive Support Services' })
    expect(benefits).toHaveClass('c4-header-cards')
    expect(support).toHaveClass('c4-header-cards')
    expect(benefits.querySelectorAll('.c4-header-cards__grid > li')).toHaveLength(6)
    expect(support.querySelectorAll('.c4-header-cards__grid > li')).toHaveLength(6)
    expect(within(benefits).getAllByRole('list')).toHaveLength(3)
    expect(within(benefits).getByText('medical appliances').tagName).toBe('LI')
    expect(within(benefits).getByText('offering emotional support').tagName).toBe('LI')
    const above = screen.getByRole('region', { name: 'Above and Beyond Care' })
    expect(above).toHaveClass('c4-header-stack')
    expect(within(above).getAllByRole('article')).toHaveLength(7)
    expect(within(above).getByText(en.hospice.aboveAndBeyond.description)).toBeVisible()
    const timeline = screen.getByRole('region', { name: 'Our Care Process' })
    expect(timeline).toHaveClass('c4-timeline')
    expect(within(timeline).getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(['Referral', 'Assessment', 'Care Plan', 'Ongoing Support', 'Communication'])
    expect(within(timeline).getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByTestId('sec-hospice-other')).toBeInTheDocument()
    expect(container.querySelector('.card-section, .card-grid')).toBeNull()
    expect(JSON.stringify(sections)).toBe(original)
    await act(() => i18n.changeLanguage('es'))
    expect(screen.getByRole('region', { name: es.hospice.comprehensiveServices.title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: es.hospice.hospiceProcess.cards.card1.title })).toBeVisible()
  })
})
