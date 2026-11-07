import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { describe, expect, it, vi } from 'vitest'
import HeroSection from '../HeroSection'
import resolveImageUrl from '../../resolveImageUrl'
import en from '../../../../locales/en/translation.json'
import es from '../../../../locales/es/translation.json'
import careImage from '../../../../assets/images/CareImage1.jpeg'
import coupleImage from '../../../../assets/images/older_couple_smiling.jpeg'

vi.unmock('react-i18next')

// DT-902: Mount hero variants with the shared i18n instance and working router context.
async function show (props = {}) {
  const i18n = createInstance()
  await i18n.use(initReactI18next).init({ resources: { en: { translation: en }, es: { translation: es } }, lng: 'en', fallbackLng: 'en' })
  const wrapper = ({ children }) => <I18nextProvider i18n={i18n}><MemoryRouter>{children}</MemoryRouter></I18nextProvider>
  return { ...render(<HeroSection title='Care' description='Support for your family.' {...props} />, { wrapper }), i18n }
}

// DT-902: Verify positioning, optional controls, decorative imagery/icons, and failed-image recovery.
describe('HeroSection', () => {
  it('renders a left background hero with a house badge and scheduling action', async () => {
    const { container } = await show({ imageUrl: '/assets/images/CareImage1.jpeg', iconName: 'House', buttonText: 'Schedule', className: 'custom-hero' })
    expect(screen.getByRole('region', { name: 'Care' })).toHaveClass('c4-hero--background', 'c4-hero--left', 'c4-hero--image')
    expect(container.querySelector('section')).toHaveClass('custom-hero')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Care')
    expect(container.querySelector('img')).toHaveAttribute('src', careImage)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
    expect(container.querySelector('.c4-hero__icon')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.lucide-house')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Schedule' })).toHaveAttribute('href', '/schedule')
  })

  // DT-902: Overlays remain enabled by default and can be disabled without removing the photo.
  it('opts out of the tint without changing the default for other heroes', async () => {
    const { container, rerender } = await show({ imageUrl: careImage })
    expect(container.querySelector('section')).not.toHaveClass('c4-hero--no-overlay')
    rerender(<HeroSection title='Care' imageUrl={careImage} showOverlay={false} />)
    expect(container.querySelector('section')).toHaveClass('c4-hero--no-overlay', 'c4-hero--image')
    expect(container.querySelector('img')).toHaveAttribute('src', careImage)
  })

  it('supports right-hand forest content and an external CTA', async () => {
    const { container } = await show({ contentPosition: 'right', tone: 'forest', iconName: 'Heart', buttonText: 'Contact', buttonLink: 'https://example.com/contact' })
    expect(container.querySelector('section')).toHaveClass('c4-hero--right', 'c4-hero--forest')
    expect(container.querySelector('.lucide-heart')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('keeps content usable without a photo and after a failed photo, and accepts a replacement', async () => {
    const { container, rerender } = await show()
    expect(container.querySelector('img, .c4-hero__icon, select, a')).toBeNull()
    rerender(<HeroSection title='Care' imageUrl={careImage} />)
    fireEvent.error(container.querySelector('img'))
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Care' })).toBeVisible()
    expect(container.querySelector('section')).not.toHaveClass('c4-hero--image')
    rerender(<HeroSection title='Care' imageUrl={coupleImage} />)
    expect(container.querySelector('img')).toHaveAttribute('src', coupleImage)
  })

  it('labels the split photo and synchronizes all language selections through shared i18n', async () => {
    const { i18n, container } = await show({ variant: 'split', imageUrl: careImage, imageAlt: 'Caregiver and patient', showLanguageSelector: true })
    expect(container.querySelector('section')).toHaveClass('c4-hero--split')
    expect(screen.getByRole('img', { name: 'Caregiver and patient' })).toBeVisible()
    const select = screen.getByRole('combobox', { name: 'Language' })
    expect(screen.getAllByRole('option')).toHaveLength(7)
    await act(async () => fireEvent.change(select, { target: { value: 'es' } }))
    expect(i18n.language).toBe('es')
    expect(screen.getByRole('combobox', { name: es.accessibility.language })).toHaveValue('es')
    await act(() => i18n.changeLanguage('ur'))
    expect(screen.getByRole('combobox')).toHaveValue('ur')
  })
})

// DT-902: Keep imported site images working while preserving unrelated CMS and remote URLs.
describe('legacy image resolution', () => {
  it('resolves only known paths and safely handles omitted images', () => {
    expect(resolveImageUrl('/images/CareImage1.jpeg')).toBe(careImage)
    expect(resolveImageUrl('/assets/images/older_couple_smiling.jpeg')).toBe(coupleImage)
    for (const url of ['https://example.com/photo.jpeg', '/uploads/custom.jpg', '/images/custom.jpeg']) expect(resolveImageUrl(url)).toBe(url)
    expect(resolveImageUrl()).toBe('')
    expect(resolveImageUrl(null)).toBe('')
  })
})
