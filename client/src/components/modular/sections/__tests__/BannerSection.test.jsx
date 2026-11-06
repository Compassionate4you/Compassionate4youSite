import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { createInstance } from 'i18next'
import BannerSection from '../BannerSection'
import HeaderTextSection from '../HeaderTextSection'
import CardSection from '../CardSection'

vi.unmock('react-i18next')

// DT-902: Exercise shared banner accessibility, both live renderers, and localized card content.
describe('full Welcome banners', () => {
  it('links unique headings and hides decorative badges from assistive technology', () => {
    const { container } = render(<><BannerSection title='Care' /><BannerSection title='Care' /></>)
    const regions = screen.getAllByRole('region', { name: 'Care' })
    expect(regions[0].getAttribute('aria-labelledby')).not.toBe(regions[1].getAttribute('aria-labelledby'))
    expect(container.querySelectorAll('[aria-hidden="true"] .lucide-heart')).toHaveLength(2)
    expect(container.querySelector('svg')).toHaveAttribute('focusable', 'false')
  })

  it.each([
    ['welcome-philosophy', 'heart'],
    ['welcome-caring-since', 'heart-handshake'],
    ['welcome-about', 'users'],
    ['other-section', 'heart']
  ])('uses the correct icon for HEADER_TEXT %s independently of heading copy', (id, icon) => {
    const { container } = render(<HeaderTextSection config={{ id, content: { header: 'Custom title', text: 'Custom body' } }} />)
    expect(container.querySelector('.lucide-' + icon)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Custom title' })).toBeVisible()
    expect(screen.getByText('Custom body')).toBeVisible()
  })

  it('preserves typography overrides and passed styles', () => {
    const { container } = render(<HeaderTextSection
      content={{
        header: 'Care',
        text: 'Support',
        typography: {
          header: { align: 'right', fontFamily: 'Georgia', italic: true },
          text: { align: 'left', bold: true }
        }
      }} style={{ '--section-bg': '#123456' }}
                                 />)
    expect(screen.getByRole('heading')).toHaveStyle({ textAlign: 'right', fontFamily: 'Georgia', fontStyle: 'italic' })
    expect(screen.getByText('Support')).toHaveStyle({ textAlign: 'left', fontWeight: 'bold' })
    expect(container.querySelector('section').style.getPropertyValue('--section-bg')).toBe('#123456')
  })

  it.each([
    ['welcome-philosophy', 'heart'],
    ['welcome-caring-since', 'heart-handshake'],
    ['welcome-about', 'users']
  ])('renders localized paragraph cards in %s with the full banner', async (slug, icon) => {
    const i18n = createInstance()
    await i18n.use(initReactI18next).init({ lng: 'ur', fallbackLng: 'en', resources: { ur: { translation: {} } } })
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <CardSection config={{
          id: 'database-id',
          slug,
          cards: [{
            id: 'card',
            layoutType: 'HEADER_PARAGRAPH',
            header: { en: 'English title', ur: 'اردو عنوان' },
            paragraph: { en: 'English body', ur: 'First paragraph\nSecond paragraph\n- List item' }
          }]
        }}
        />
      </I18nextProvider>
    )
    expect(screen.getByRole('region', { name: 'اردو عنوان' })).toBeVisible()
    expect(screen.getByText('First paragraph').tagName).toBe('P')
    expect(screen.getByText('Second paragraph').tagName).toBe('P')
    expect(screen.getByRole('listitem')).toHaveTextContent('List item')
    expect(container.querySelector('.lucide-' + icon)).toBeInTheDocument()
    expect(container.querySelector('.card-section--banners')).toBeInTheDocument()
  })

  it('leaves unrelated paragraph cards and Welcome image cards unchanged', () => {
    const { container } = render(
      <>
        <CardSection config={{ id: 'other', cards: [{ id: 'text', layoutType: 'HEADER_PARAGRAPH', header: 'Other content' }] }} />
        <CardSection config={{ id: 'welcome-about', cards: [{ id: 'image', layoutType: 'IMAGE_CARD', header: 'Image content', imageUrl: '/care.jpg', imageAlt: 'Care' }] }} />
      </>
    )
    expect(container.querySelector('.c4-welcome-banner')).not.toBeInTheDocument()
    expect(container.querySelector('.card--text')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Care' })).toBeInTheDocument()
  })
})
