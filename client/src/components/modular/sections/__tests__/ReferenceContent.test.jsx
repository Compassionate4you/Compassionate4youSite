import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { describe, expect, it, vi } from 'vitest'
import WelcomeSections from '../../WelcomeSections'
import HomeHealthSections from '../../HomeHealthSections'
import HospiceSections from '../../HospiceSections'
import en from '../../../../locales/en/translation.json'
import es from '../../../../locales/es/translation.json'
import reference from './fixtures/sprint08-content.json'

vi.unmock('react-i18next')
vi.mock('../../../../services/api', () => ({ apiSubmitContactForm: vi.fn(async () => ({ success: true })) }))

// DT-902: Test adapters against content extracted from the supplied Sprint 08 HTML files.
const pages = [
  ['Welcome', WelcomeSections, 'sec-landing-', ['hero', 'philosophy', 'caring', 'info-cards', 'about', 'contact', 'map', 'faq']],
  ['Home_Health', HomeHealthSections, 'sec-hh-', ['hero', 'services', 'advantages', 'specialties', 'cta']],
  ['Hospice', HospiceSections, 'sec-hospice-', ['hero', 'understanding', 'benefits', 'comprehensive', 'above-beyond', 'process', 'contact']]
]

// DT-902: Normalize only whitespace; preserve the source wording and punctuation.
function normalize (text) {
  return text.replace(/\s+/g, ' ').trim()
}

// DT-902: Use real i18n and navigation for reference-copy and CTA assertions.
async function show (Component, prefix, names) {
  const i18n = createInstance()
  await i18n.use(initReactI18next).init({ resources: { en: { translation: en }, es: { translation: es } }, lng: 'en', fallbackLng: 'en' })
  const result = render(<I18nextProvider i18n={i18n}><MemoryRouter><Component sections={names.map(name => ({ id: prefix + name }))} /></MemoryRouter></I18nextProvider>)
  return { ...result, i18n }
}

// DT-902: Lock all reference headings, paragraphs, lists, actions, and their reading order.
describe('Sprint 08 reference content', () => {
  it.each(pages)('%s matches the supplied main-page content', async (name, Component, prefix, names) => {
    const { container } = await show(Component, prefix, names)
    const fullText = normalize(container.textContent)
    let cursor = 0
    let previousText = ''
    for (const block of reference[name]) {
      // DT-902: The user-facing Home name is now Welcome; preserve the original fixture.
      const text = normalize(block.text === 'Back to Home' ? 'Back to Welcome' : block.text)
      if (text === previousText) continue
      const position = fullText.indexOf(text, cursor)
      expect(position, `${name}: ${block.text}`).toBeGreaterThanOrEqual(cursor)
      cursor = position + text.length
      previousText = text
    }
    const bannerTitles = name === 'Welcome' ? ['Our Philosophy', 'Caring Since 2021', 'About'] : []
    const expectedHeadings = reference[name].filter(block => /^h[12]$/.test(block.tag) || bannerTitles.includes(block.text)).map(block => block.text).filter((text, index, headings) => text !== headings[index - 1])
    expect([...container.querySelectorAll('h1,h2')].map(node => node.textContent)).toEqual(expectedHeadings)
    const cardHeadings = [...container.querySelectorAll('h2,h3')].map(node => node.textContent)
    let previousIndex = -1
    for (const block of reference[name].filter(block => block.tag === 'h3')) {
      const index = cardHeadings.indexOf(block.text, previousIndex + 1)
      expect(index, `Heading order: ${block.text}`).toBeGreaterThan(previousIndex)
      previousIndex = index
    }
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelector('.card-section, .card-grid')).toBeNull()
    const scheduleLinks = screen.queryAllByRole('link').filter(link => link.getAttribute('href') === '/schedule')
    expect(scheduleLinks).toHaveLength(name === 'Welcome' ? 0 : 2)
    if (name !== 'Welcome') expect(screen.getByRole('link', { name: 'Back to Welcome' })).toHaveAttribute('href', '/welcome')
    if (name === 'Welcome') {
      // DT-902: Only the two informational cards use the new bordered photo presentation.
      const medicare = screen.getByRole('article', { name: en.landing.infoCards.card1.header })
      const specialty = screen.getByRole('article', { name: en.landing.infoCards.card2.header })
      expect(medicare).toHaveClass('c4-photo-card')
      expect(medicare).not.toHaveClass('c4-photo-card--right')
      expect(specialty).toHaveClass('c4-photo-card--right')
      expect(specialty.querySelectorAll('.c4-photo-card__body p')).toHaveLength(2)
      expect(screen.getByRole('region', { name: en.landing.heroTitle })).toHaveClass('c4-welcome-hero')
      expect(screen.getByRole('link', { name: 'Get Directions' })).toHaveAttribute('href', expect.stringContaining('destination=1501'))
      expect(screen.getByRole('img', { name: en.landing.infoCards.card1.imageAlt })).toHaveAttribute('src', expect.stringContaining('working_a_puzzle'))
    }
  })

  it('keeps the restored Welcome contact form operational and updates translated content', async () => {
    const { i18n } = await show(WelcomeSections, 'sec-landing-', ['hero', 'contact', 'faq'])
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Test Visitor' } })
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'visitor@example.com' } })
    fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: 'Please contact our family.' } })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Send Message' })))
    const { apiSubmitContactForm } = await import('../../../../services/api')
    expect(apiSubmitContactForm).toHaveBeenCalledWith({ name: 'Test Visitor', email: 'visitor@example.com', message: 'Please contact our family.' })
    await act(() => i18n.changeLanguage('es'))
    expect(screen.getByRole('heading', { name: es.landing.heroTitle })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: es.faq.title })).toBeInTheDocument()
  })
})

// DT-902: Exercise page-specific surfaces, untinted photos, and semantic icon assignments in two languages.
describe('service page presentation refinements', () => {
  it.each([
    [HomeHealthSections, 'sec-hh-', ['hero', 'services', 'advantages', 'specialties'], [
      ['stethoscope', 'activity', 'accessibility', 'cross', 'speech', 'house', 'users', 'languages'],
      ['clipboard-check', 'coins', 'trending-up', 'clipboard-list', 'house', 'shield-check', 'graduation-cap'],
      ['heart-pulse', 'wind', 'bone', 'bandage', 'droplets', 'activity', 'pill', 'flask-conical', 'apple', 'test-tube']
    ]],
    [HospiceSections, 'sec-hospice-', ['hero', 'benefits', 'comprehensive'], [
      ['heart-handshake', 'clock', 'briefcase-medical', 'stethoscope', 'cross', 'users'],
      ['house', 'church', 'hand-helping', 'calendar-days', 'accessibility', 'phone']
    ]]
  ])('renders the requested hero and card options for %s', async (Page, prefix, names, icons) => {
    const { container, i18n } = await show(Page, prefix, names)
    for (const language of ['en', 'es']) {
      await act(() => i18n.changeLanguage(language))
      expect(container.querySelector('.c4-hero')).toHaveClass('c4-hero--no-overlay', 'c4-hero--image')
      const sections = container.querySelectorAll('.c4-header-cards')
      expect(sections).toHaveLength(icons.length)
      sections.forEach((section, index) => {
        const actual = section.querySelectorAll('.c4-header-cards__icon svg')
        expect(actual).toHaveLength(icons[index].length)
        actual.forEach((icon, cardIndex) => {
          expect(icon).toHaveClass(`lucide-${icons[index][cardIndex]}`)
          expect(icon).toHaveAttribute('aria-hidden', 'true')
        })
        expect(section.classList.contains('c4-header-cards--white')).toBe(Page === HomeHealthSections && index !== 1)
      })
    }
  })
})
