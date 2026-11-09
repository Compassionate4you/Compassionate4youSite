// DT-893 / DT-905 / DT-907 Sprint 9
// Gandhar Tare
// Content editor formatting (align, bold/weight, italic, font): the bugs that
// stopped it applying consistently, and their fixes.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  isUntouchedDefault,
  normalizeTypography,
  typographyScopeProps,
  typographyStyle
} from '../typographyStyle'
import TypographyScope from '../TypographyScope'
import TypographyControls from '../../admin/content/TypographyControls'
import HeaderParagraphCard from '../cards/HeaderParagraphCard'
import DynamicSectionRenderer from '../DynamicSectionRenderer'
import HomeHealthSections from '../HomeHealthSections'
import { SectionStorageService } from '../../../services/sectionStorageService'

const here = path.dirname(fileURLToPath(import.meta.url))

// What the editor used to save when the formatting bar was never touched.
const OLD_UNTOUCHED = { align: 'left', bold: false, italic: false, fontFamily: 'inherit' }

afterEach(() => vi.restoreAllMocks())

describe('formatting rules (typographyStyle)', () => {
  it('treats the old untouched default as "nothing chosen" (bug: it forced left alignment)', () => {
    expect(isUntouchedDefault(OLD_UNTOUCHED)).toBe(true)
    expect(normalizeTypography(OLD_UNTOUCHED)).toBeNull()
    expect(typographyStyle(OLD_UNTOUCHED)).toEqual({})
  })

  it('still applies a real choice of left together with other settings', () => {
    expect(typographyStyle({ align: 'left', italic: true })).toEqual({ textAlign: 'left', fontStyle: 'italic' })
  })

  it('applies center, right and justify', () => {
    for (const align of ['center', 'right', 'justify']) {
      expect(typographyStyle({ align })).toEqual({ textAlign: align })
    }
  })

  it('bold makes text bold', () => {
    expect(typographyStyle({ bold: true })).toEqual({ fontWeight: 'bold' })
  })

  it('Regular forces normal weight, so bold headings can be un-bolded (bug: turning bold off did nothing)', () => {
    expect(typographyStyle({ bold: false, weight: 'normal' })).toEqual({ fontWeight: 'normal' })
  })

  it('leaves weight alone when nothing was chosen', () => {
    expect(typographyStyle({ bold: false, align: 'center' })).toEqual({ textAlign: 'center' })
  })

  it('applies a chosen font and ignores "inherit"', () => {
    expect(typographyStyle({ fontFamily: 'Georgia, Cambria, serif' })).toEqual({ fontFamily: 'Georgia, Cambria, serif' })
    expect(typographyStyle({ fontFamily: 'inherit', italic: true })).toEqual({ fontStyle: 'italic' })
  })

  it('ignores missing or broken values', () => {
    expect(typographyStyle(undefined)).toEqual({})
    expect(typographyStyle({ align: 'sideways' })).toEqual({})
  })
})

describe('cards use the same rules', () => {
  it('a card saved with the old untouched default keeps its own alignment', () => {
    render(<HeaderParagraphCard header='Title' paragraph='Body' alignment='center' typography={{ header: OLD_UNTOUCHED }} />)
    expect(screen.getByText('Title')).not.toHaveStyle({ textAlign: 'left' })
    expect(screen.getByText('Title').getAttribute('style') || '').not.toContain('text-align')
  })

  it('a card heading set to Regular is no longer bold', () => {
    render(<HeaderParagraphCard header='Title' paragraph='Body' typography={{ header: { weight: 'normal' } }} />)
    expect(screen.getByText('Title')).toHaveStyle({ fontWeight: 'normal' })
  })
})

describe('section titles and descriptions (TypographyScope)', () => {
  it('adds nothing when no formatting was chosen', () => {
    const { container } = render(<TypographyScope typography={{ header: OLD_UNTOUCHED }}><h2>Hi</h2></TypographyScope>)
    expect(container.querySelector('.c4-typography-scope')).toBeNull()
    expect(container.firstChild.tagName).toBe('H2')
  })

  it('passes the chosen settings to the title and description', () => {
    const props = typographyScopeProps({ header: { align: 'center', bold: true }, text: { italic: true } })
    expect(props.style).toEqual({
      '--c4-heading-align': 'center',
      '--c4-heading-weight': '700',
      '--c4-text-style': 'italic'
    })
    expect(Object.keys(props.data).sort()).toEqual(['data-heading-align', 'data-heading-weight', 'data-text-style'])
  })

  it('the stylesheet targets every section title and description class', () => {
    const css = fs.readFileSync(path.resolve(here, '../../../styles/components/modular/typography-scope.css'), 'utf8')
    for (const cls of [
      'c4-section__title', 'c4-hero__title', 'c4-welcome-banner__title', 'modular-contact-section__title',
      'faq-section__title', 'modular-map-section__title', 'modular-fullscreen-header-section__title',
      'account-benefits-section__title',
      'c4-section__subtitle', 'c4-hero__description', 'c4-welcome-banner__description',
      'modular-map-section__address', 'modular-fullscreen-header-section__text'
    ]) {
      expect(css, cls).toContain(`.${cls}`)
    }
    // Card text has its own formatting and is not touched by the section's.
    expect(css).not.toContain('.c4-section__description')
  })

  it('the classes it targets really are the ones the section components use', () => {
    const read = (f) => fs.readFileSync(path.resolve(here, '../sections', f), 'utf8')
    expect(read('SectionHeading.jsx')).toContain('c4-section__title')
    expect(read('HeroSection.jsx')).toContain('c4-hero__title')
    expect(read('MapSection.jsx')).toContain('modular-map-section__title')
    expect(read('FAQSection.jsx')).toContain('faq-section__title')
    expect(read('ContactFormSection.jsx')).toContain('modular-contact-section__title')
    expect(read('FullscreenImageHeaderSection.jsx')).toContain('modular-fullscreen-header-section__title')
    expect(read('AccountBenefitsSection.jsx')).toContain('account-benefits-section__title')
  })
})

describe('sections that used to ignore the formatting bar now get it', () => {
  it.each([
    ['MAP_SECTION', { header: 'Visit us', mapAddress: '1 Main St' }],
    ['FAQ_SECTION', { header: 'FAQ', faqItems: [] }],
    ['FULLSCREEN_IMAGE_HEADER', { header: 'Welcome', text: 'Hello' }],
    ['ACCOUNT_BENEFITS', { header: 'Benefits', items: [] }]
  ])('%s', (layout, content) => {
    const { container } = render(
      <DynamicSectionRenderer config={{ id: 's1', layout, content: { ...content, typography: { header: { align: 'center' } } } }} />
    )
    const scope = container.querySelector('.c4-typography-scope')
    expect(scope).not.toBeNull()
    expect(scope.style.getPropertyValue('--c4-heading-align')).toBe('center')
  })
})

describe('the Welcome, Home Health and Hospice pages now apply saved formatting', () => {
  it('a Home Health section with a centered title gets the formatting', () => {
    const { container } = render(
      <HomeHealthSections sections={[{ id: 'sec-hh-services', layout: 'CARD_GRID', content: { typography: { header: { align: 'center' } } } }]} />
    )
    const scope = container.querySelector('.c4-typography-scope')
    expect(scope).not.toBeNull()
    expect(scope.querySelector('.c4-section__title')).not.toBeNull()
  })

  it('a section saved with the old untouched default renders exactly as before', () => {
    const { container } = render(
      <HomeHealthSections sections={[{ id: 'sec-hh-services', layout: 'CARD_GRID', content: { typography: { header: OLD_UNTOUCHED } } }]} />
    )
    expect(container.querySelector('.c4-typography-scope')).toBeNull()
  })
})

describe('the formatting bar (TypographyControls)', () => {
  function renderBar (value) {
    const onChange = vi.fn()
    render(<TypographyControls value={value} onChange={onChange} />)
    return onChange
  }

  it('shows Default, not Left, when nothing was chosen (bug: Left was shown and saved)', () => {
    renderBar({})
    expect(screen.getByRole('button', { name: 'Default alignment' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Align Left' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows Default for the old untouched default too', () => {
    renderBar(OLD_UNTOUCHED)
    expect(screen.getByRole('button', { name: 'Default alignment' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('choosing center saves center', async () => {
    const user = userEvent.setup()
    const onChange = renderBar({})
    await user.click(screen.getByRole('button', { name: 'Align Center' }))
    expect(onChange).toHaveBeenCalledWith({ align: 'center', bold: false, italic: false, fontFamily: 'inherit' })
  })

  it('choosing Default saves no alignment at all', async () => {
    const user = userEvent.setup()
    const onChange = renderBar({ align: 'right' })
    await user.click(screen.getByRole('button', { name: 'Default alignment' }))
    expect(onChange.mock.calls[0][0]).not.toHaveProperty('align')
  })

  it('weight can be set to Regular to un-bold a heading', async () => {
    const user = userEvent.setup()
    const onChange = renderBar({})
    await user.click(screen.getByRole('button', { name: 'Font weight selector' }))
    await user.click(screen.getByRole('option', { name: 'Regular (not bold)' }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ bold: false, weight: 'normal' }))
  })

  it('weight Bold saves bold', async () => {
    const user = userEvent.setup()
    const onChange = renderBar({})
    await user.click(screen.getByRole('button', { name: 'Font weight selector' }))
    await user.click(screen.getByRole('option', { name: 'Bold' }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ bold: true }))
    expect(onChange.mock.calls[0][0]).not.toHaveProperty('weight')
  })

  it('italic toggles', async () => {
    const user = userEvent.setup()
    const onChange = renderBar({})
    await user.click(screen.getByRole('button', { name: 'Italic' }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ italic: true }))
  })
})

describe('the editors no longer start with forced left alignment', () => {
  it.each(['SectionManager.jsx', 'CardManager.jsx'])('%s', (file) => {
    const src = fs.readFileSync(path.resolve(here, '../../admin/content', file), 'utf8')
    expect(src).not.toContain("{ align: 'left', fontFamily: 'inherit', bold: false, italic: false }")
  })
})

describe('a failed database save is reported (bug: the editor said "Updated" anyway)', () => {
  it('lastSave resolves to false when the server rejects the update', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, json: async () => ({}) })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    SectionStorageService.data = [{ id: 'sec-x', layout: 'HEADER_TEXT', content: {}, colors: {} }]

    SectionStorageService.updateSection('sec-x', { content: { header: 'New' } })

    await expect(SectionStorageService.lastSave).resolves.toBe(false)
  })

  it('lastSave resolves to true when it was saved', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({}) })
    SectionStorageService.data = [{ id: 'sec-x', layout: 'HEADER_TEXT', content: {}, colors: {} }]

    SectionStorageService.updateSection('sec-x', { content: { header: 'New' } })

    await expect(SectionStorageService.lastSave).resolves.toBe(true)
  })
})
