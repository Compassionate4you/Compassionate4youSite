import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import DynamicSectionRenderer from '../DynamicSectionRenderer'
import ModularCard from '../cards/ModularCard'
import ColorEditor, { DEFAULT_SECTION_COLORS, DEFAULT_CARD_COLORS } from '../../admin/content/ColorEditor'
import SectionManager from '../../admin/content/SectionManager'
import CardManager from '../../admin/content/CardManager'
import { CardStorageService } from '../../../services/cardStorageService'
import { SectionStorageService } from '../../../services/sectionStorageService'
import { PageStorageService } from '../../../services/pageStorageService'

vi.mock('../../../services/publicLocationsApi', () => ({
  getPublicLocations: vi.fn(() => new Promise(() => {}))
}))

const CUSTOM_SECTION_COLORS = {
  backgroundColor: { light: '#f1f5f9', dark: '#111827' },
  headerColor: { light: '#1e3a8a', dark: '#93c5fd' },
  textColor: { light: '#334155', dark: '#e2e8f0' },
  accentColor: { light: '#366454', dark: '#4ade80' }
}

const CUSTOM_CARD_COLORS = {
  backgroundColor: { light: '#fefce8', dark: '#1f2937' },
  headerColor: { light: '#713f12', dark: '#fde047' },
  textColor: { light: '#422006', dark: '#f3f4f6' }
}

const SAMPLE_ITEMS = [
  { id: 'item-1', heading: 'First Item', title: 'First Item', description: 'First description text', iconName: 'Heart' },
  { id: 'item-2', heading: 'Second Item', title: 'Second Item', description: 'Second description text', iconName: 'Users' }
]

const SAMPLE_CARDS = [
  {
    id: 'card-hp',
    layout: 'HEADER_PARAGRAPH',
    content: {
      header: 'Paragraph Card',
      paragraph: 'Card body text\n- Bullet item',
      alignment: 'left',
      colors: CUSTOM_CARD_COLORS
    }
  },
  {
    id: 'card-hs',
    layout: 'HEADER_SYMBOL',
    content: {
      header: 'Symbol Card',
      paragraph: 'Symbol card description',
      symbol: 'ShieldCheck',
      alignment: 'center',
      colors: CUSTOM_CARD_COLORS
    }
  },
  {
    id: 'card-img',
    layout: 'IMAGE_FULL_WIDTH',
    content: {
      header: 'Image Full Width Card',
      paragraph: 'Split image body',
      imageUrl: '/assets/images/CareImage1.jpeg',
      imageAlt: 'Care photo',
      alignment: 'left',
      colors: CUSTOM_CARD_COLORS
    }
  },
  {
    id: 'card-photo',
    layout: 'PHOTO_TEXT_CARD',
    content: {
      header: 'Photo Text Card',
      paragraph: 'Bordered photo card text',
      imageUrl: '/images/older_couple_smiling.jpeg',
      imageAlt: 'Older couple',
      alignment: 'right',
      colors: CUSTOM_CARD_COLORS
    }
  }
]

const ALL_SECTION_CASES = [
  {
    layout: 'HEADER_TEXT',
    selector: 'section.c4-welcome-banner',
    content: { header: 'Header Text', text: 'Banner description', icon: 'Heart' }
  },
  {
    layout: 'WELCOME_HERO',
    selector: 'section.c4-welcome-hero',
    content: { header: 'Welcome Hero', text: 'Welcome description', imageUrl: '/assets/images/CareImage1.jpeg', imageAlt: 'Welcome' }
  },
  {
    layout: 'HERO_SECTION',
    selector: 'section.c4-hero',
    content: { header: 'Split Hero', text: 'Hero description', heroVariant: 'split', heroTone: 'teal', icon: 'House', buttonText: 'Schedule', imageUrl: '/assets/images/CareImage1.jpeg' }
  },
  {
    layout: 'HEADER_CARDS',
    selector: 'section.c4-header-cards',
    content: { label: 'Services', header: 'Header Cards', text: 'Subtitle', items: SAMPLE_ITEMS }
  },
  {
    layout: 'HEADER_STACK',
    selector: 'section.c4-header-stack',
    content: { label: 'Overview', header: 'Header Stack', text: 'Subtitle', gridCols: 2, items: SAMPLE_ITEMS }
  },
  {
    layout: 'TIMELINE_SECTION',
    selector: 'section.c4-timeline',
    content: { label: 'Process', header: 'Timeline Section', text: 'Steps', items: SAMPLE_ITEMS }
  },
  {
    layout: 'PAGE_CTA',
    selector: 'section.c4-page-cta',
    content: { header: 'Page CTA', text: 'Get started today', buttonText: 'Schedule Now', secondaryButtonText: 'Back Home' }
  },
  {
    layout: 'IMAGE_HEADER_TEXT',
    selector: 'section.modular-image-header-text-section',
    content: { header: 'Image Header Text', text: 'Feature copy', imageUrl: '/assets/images/CareImage1.jpeg', imagePosition: 'right', buttonText: 'Learn More', buttonLink: '/schedule' }
  },
  {
    layout: 'FULLSCREEN_IMAGE_HEADER',
    selector: 'section.modular-fullscreen-header-section',
    content: { header: 'Fullscreen Header', text: 'Overlay copy', imageUrl: '/assets/images/CareImage1.jpeg', icon: '✦', buttonText: 'Explore', buttonLink: '/schedule' }
  },
  {
    layout: 'CARD_GRID',
    selector: 'section.card-section',
    content: { header: 'Card Grid', gridCols: 2, cards: SAMPLE_CARDS.slice(0, 2) }
  },
  {
    layout: 'MAP_SECTION',
    selector: 'section.modular-map-section',
    content: { header: 'Office Map', mapAddress: '1501 N Broadway, Walnut Creek, CA' }
  },
  {
    layout: 'LOCATION_MAPS',
    selector: 'section.modular-map-section',
    content: { header: 'Dynamic Locations', hideHeading: false, mapAddress: '1501 N Broadway, Walnut Creek, CA' }
  },
  {
    layout: 'ACCOUNT_BENEFITS',
    selector: 'section.account-benefits-section',
    content: { header: 'Account Benefits', items: SAMPLE_ITEMS }
  },
  {
    layout: 'CONTACT_FORM',
    selector: 'section.modular-contact-section',
    content: { header: 'Contact Us', phone: '555-0100', email: 'care@example.com' }
  },
  {
    layout: 'FAQ_SECTION',
    selector: 'section.faq-section',
    content: { header: 'FAQ', faqItems: [{ question: 'Question 1?', answer: 'Answer 1.' }] }
  }
]

const stylesRoot = resolve(process.cwd(), 'src/styles')
function readCss (relativePath) {
  return readFileSync(resolve(stylesRoot, relativePath), 'utf8')
}

describe('All 15 section layouts apply color management & dark/light themes', () => {
  it.each(ALL_SECTION_CASES)('$layout applies custom light and dark CSS color tokens', ({ layout, selector, content }) => {
    const config = {
      id: `test-${layout.toLowerCase()}`,
      layout,
      content: { ...content, colors: CUSTOM_SECTION_COLORS }
    }

    const { container, rerender } = render(
      <MemoryRouter>
        <DynamicSectionRenderer config={config} theme='light' />
      </MemoryRouter>
    )

    const lightEl = container.querySelector(selector)
    expect(lightEl, `${layout} should render ${selector}`).not.toBeNull()
    expect(lightEl.style.getPropertyValue('--section-bg')).toBe('#f1f5f9')
    expect(lightEl.style.getPropertyValue('--section-header')).toBe('#1e3a8a')
    expect(lightEl.style.getPropertyValue('--section-text')).toBe('#334155')
    expect(lightEl.style.getPropertyValue('--section-accent')).toBe('#366454')
    expect(lightEl.style.getPropertyValue('--section-accent-text')).toBe('#ffffff')

    rerender(
      <MemoryRouter>
        <DynamicSectionRenderer config={config} theme='dark' />
      </MemoryRouter>
    )

    const darkEl = container.querySelector(selector)
    expect(darkEl).not.toBeNull()
    expect(darkEl.style.getPropertyValue('--section-bg')).toBe('#111827')
    expect(darkEl.style.getPropertyValue('--section-header')).toBe('#93c5fd')
    expect(darkEl.style.getPropertyValue('--section-text')).toBe('#e2e8f0')
    expect(darkEl.style.getPropertyValue('--section-accent')).toBe('#4ade80')
    // Bright dark-mode accent (#4ade80) automatically receives dark contrasting text (#0f172a)
    expect(darkEl.style.getPropertyValue('--section-accent-text')).toBe('#0f172a')
  })

  it('applies section colors to CARD_GRID when all cards are PHOTO_TEXT_CARD', () => {
    const config = {
      id: 'photo-grid',
      layout: 'CARD_GRID',
      content: {
        header: 'Photo Cards',
        colors: CUSTOM_SECTION_COLORS,
        cards: [SAMPLE_CARDS[3]]
      }
    }

    const { container } = render(
      <MemoryRouter>
        <DynamicSectionRenderer config={config} theme='dark' />
      </MemoryRouter>
    )

    const photoSection = container.querySelector('section.c4-photo-cards')
    expect(photoSection).not.toBeNull()
    expect(photoSection.style.getPropertyValue('--section-bg')).toBe('#111827')
    const photoCard = container.querySelector('article.c4-photo-card')
    expect(photoCard).not.toBeNull()
    expect(photoCard.style.getPropertyValue('--card-bg')).toBe('#1f2937')
    expect(photoCard.style.getPropertyValue('--card-header')).toBe('#fde047')
    expect(photoCard.style.getPropertyValue('--card-text')).toBe('#f3f4f6')
  })
})

describe('All 4 card layouts apply color management, typography & dark/light themes', () => {
  it.each([
    ['HEADER_PARAGRAPH', 'article.card--text', SAMPLE_CARDS[0]],
    ['HEADER_SYMBOL', 'article.card--symbol', SAMPLE_CARDS[1]],
    ['IMAGE_FULL_WIDTH', 'article.card--image', SAMPLE_CARDS[2]],
    ['PHOTO_TEXT_CARD', 'article.c4-photo-card', SAMPLE_CARDS[3]]
  ])('%s applies custom light/dark --card-* CSS variables', (layout, selector, card) => {
    const { container, rerender } = render(<ModularCard card={card} theme='light' />)

    const lightCard = container.querySelector(selector)
    expect(lightCard, `${layout} should render ${selector}`).not.toBeNull()
    expect(lightCard.style.getPropertyValue('--card-bg')).toBe('#fefce8')
    expect(lightCard.style.getPropertyValue('--card-header')).toBe('#713f12')
    expect(lightCard.style.getPropertyValue('--card-text')).toBe('#422006')

    rerender(<ModularCard card={card} theme='dark' />)

    const darkCard = container.querySelector(selector)
    expect(darkCard.style.getPropertyValue('--card-bg')).toBe('#1f2937')
    expect(darkCard.style.getPropertyValue('--card-header')).toBe('#fde047')
    expect(darkCard.style.getPropertyValue('--card-text')).toBe('#f3f4f6')
  })

  it('resolves legacy bundled image paths in ImageCard and PhotoTextCard', () => {
    const { container: imgContainer } = render(<ModularCard card={SAMPLE_CARDS[2]} theme='light' />)
    const imgEl = imgContainer.querySelector('img.card__image')
    expect(imgEl).not.toBeNull()
    expect(imgEl.getAttribute('src')).not.toBe('/assets/images/CareImage1.jpeg')

    const { container: photoContainer } = render(<ModularCard card={SAMPLE_CARDS[3]} theme='light' />)
    const photoEl = photoContainer.querySelector('img.c4-photo-card__image')
    expect(photoEl).not.toBeNull()
    expect(photoEl.getAttribute('src')).not.toBe('/images/older_couple_smiling.jpeg')
  })

  it('guards unreadable low-contrast text colors in sections and cards for light and dark modes', () => {
    const lowContrastSection = {
      id: 'sec-low-contrast',
      layout: 'HERO_SECTION',
      content: {
        header: { en: 'Low Contrast Hero' },
        paragraph: { en: 'Subtitle text' },
        colors: {
          backgroundColor: { light: '#ffffff', dark: '#1e293b' },
          headerColor: { light: '#ffffff', dark: '#1e293b' },
          textColor: { light: '#f8fafc', dark: '#0f172a' },
          accentColor: { light: '#0f4c5c', dark: '#4ade80' }
        }
      }
    }

    const { container: lightSec } = render(<DynamicSectionRenderer config={lowContrastSection} theme='light' />)
    const lightRoot = lightSec.querySelector('section.c4-hero')
    expect(lightRoot.style.getPropertyValue('--section-header')).toBe('#0f172a')
    expect(lightRoot.style.getPropertyValue('--section-text')).toBe('#0f172a')

    const { container: darkSec } = render(<DynamicSectionRenderer config={lowContrastSection} theme='dark' />)
    const darkRoot = darkSec.querySelector('section.c4-hero')
    expect(darkRoot.style.getPropertyValue('--section-header')).toBe('#f8fafc')
    expect(darkRoot.style.getPropertyValue('--section-text')).toBe('#f8fafc')

    const lowContrastCard = {
      id: 'card-low-contrast',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: { en: 'Low Contrast Card' },
        paragraph: { en: 'Card body' },
        colors: {
          backgroundColor: { light: '#ffffff', dark: '#1e293b' },
          headerColor: { light: '#ffffff', dark: '#1e293b' },
          textColor: { light: '#f8fafc', dark: '#0f172a' }
        }
      }
    }

    const { container: lightCard } = render(<ModularCard card={lowContrastCard} theme='light' />)
    const lightCardEl = lightCard.querySelector('article.card--text')
    expect(lightCardEl.style.getPropertyValue('--card-header')).toBe('#0f172a')
    expect(lightCardEl.style.getPropertyValue('--card-text')).toBe('#0f172a')

    const { container: darkCard } = render(<ModularCard card={lowContrastCard} theme='dark' />)
    const darkCardEl = darkCard.querySelector('article.card--text')
    expect(darkCardEl.style.getPropertyValue('--card-header')).toBe('#f8fafc')
    expect(darkCardEl.style.getPropertyValue('--card-text')).toBe('#f8fafc')
  })
})

describe('ColorEditor & Manager Live Previews propagate colors and dark mode attributes', () => {
  it('updates both light and dark values via ColorEditor inputs and presets', () => {
    const handleChange = vi.fn()
    render(
      <ColorEditor
        fields={[
          {
            key: 'backgroundColor',
            label: 'Background Color',
            value: DEFAULT_SECTION_COLORS.backgroundColor,
            defaultPair: DEFAULT_SECTION_COLORS.backgroundColor,
            onChange: handleChange
          }
        ]}
      />
    )

    const lightInput = screen.getByLabelText('Background Color Light Mode Hex')
    const darkInput = screen.getByLabelText('Background Color Dark Mode Hex')

    expect(lightInput).toHaveStyle({ color: 'rgb(15, 23, 42)' })
    expect(darkInput).toHaveStyle({ color: 'rgb(15, 23, 42)' })

    fireEvent.change(lightInput, { target: { value: '#abcdef' } })
    expect(handleChange).toHaveBeenCalledWith({ light: '#abcdef', dark: DEFAULT_SECTION_COLORS.backgroundColor.dark })

    fireEvent.change(darkInput, { target: { value: '#123456' } })
    expect(handleChange).toHaveBeenCalledWith({ light: DEFAULT_SECTION_COLORS.backgroundColor.light, dark: '#123456' })
  })

  it('toggles theme and data-theme on SectionManager live preview container', () => {
    vi.spyOn(PageStorageService, 'loadFromDatabase').mockResolvedValue([])
    vi.spyOn(SectionStorageService, 'loadFromDatabase').mockResolvedValue([])
    vi.spyOn(CardStorageService, 'loadFromDatabase').mockResolvedValue([])

    const { container } = render(
      <MemoryRouter>
        <SectionManager onNotification={vi.fn()} />
      </MemoryRouter>
    )

    const previewToggle = screen.getByRole('button', { name: /Dark Mode/i })
    expect(container.querySelector('[data-theme="light"][theme="light"]')).not.toBeNull()

    fireEvent.click(previewToggle)
    expect(container.querySelector('[data-theme="dark"][theme="dark"]')).not.toBeNull()
  })

  it('toggles theme and data-theme on CardManager live preview container', () => {
    vi.spyOn(SectionStorageService, 'loadFromDatabase').mockResolvedValue([])
    vi.spyOn(CardStorageService, 'loadFromDatabase').mockResolvedValue([])

    const { container } = render(
      <MemoryRouter>
        <CardManager onNotification={vi.fn()} />
      </MemoryRouter>
    )

    const previewToggle = screen.getByRole('button', { name: /Dark Mode/i })
    expect(container.querySelector('[data-theme="light"][theme="light"]')).not.toBeNull()

    fireEvent.click(previewToggle)
    expect(container.querySelector('[data-theme="dark"][theme="dark"]')).not.toBeNull()
    expect(DEFAULT_CARD_COLORS.backgroundColor.dark).toBe('#1e293b')
  })
})

describe('CSS stylesheets wire section/card color variables and dark mode tokens', () => {
  it('defines both light and dark scoped attribute selectors in global.css', () => {
    const globalCss = readCss('global.css')
    expect(globalCss).toContain("[theme='light']")
    expect(globalCss).toContain("[data-theme='light']")
    expect(globalCss).toContain("[theme='dark']")
    expect(globalCss).toContain("[data-theme='dark']")
  })

  it.each([
    'components/modular/sections/SectionShared.css',
    'components/modular/sections/BannerSection.css',
    'components/modular/sections/HeroSection.css',
    'components/modular/sections/HeaderCardsSection.css',
    'components/modular/sections/HeaderStackSection.css',
    'components/modular/sections/TimelineSection.css',
    'components/modular/sections/ContactFormSection.css',
    'components/modular/sections/FullscreenImageHeaderSection.css',
    'components/modular/sections/AccountBenefitsSection.css',
    'components/modular/sections/ImageHeaderTextSection.css',
    'components/modular/sections/MapSection.css',
    'components/modular/sections/CardSection.css',
    'components/modular/sections/FAQSection.css'
  ])('%s consumes --section-* variables without dropping color management', (cssPath) => {
    const css = readCss(cssPath)
    expect(css).toMatch(/--section-(bg|header|text|accent)/)
  })

  it.each([
    'components/modular/cards/HeaderParagraphCard.css',
    'components/modular/cards/HeaderSymbolCard.css',
    'components/modular/cards/ImageCard.css',
    'components/modular/cards/PhotoTextCard.css'
  ])('%s consumes --card-bg, --card-header, and --card-text variables', (cssPath) => {
    const css = readCss(cssPath)
    expect(css).toContain('--card-bg')
    expect(css).toContain('--card-header')
    expect(css).toContain('--card-text')
  })
})
