import { act, render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import CardSection from '../../CardSection';
import en from '../../../../locales/en/translation.json';
import ur from '../../../../locales/ur/translation.json';
import pa from '../../../../locales/pa/translation.json';
import hi from '../../../../locales/hi/translation.json';

vi.unmock('react-i18next');
vi.mock('../../../../hooks/useSection', () => ({ default: vi.fn() }));
import useSection from '../../../../hooks/useSection';

const resources = { en: { translation: en }, ur: { translation: ur }, pa: { translation: pa }, hi: { translation: hi } };
const cards = [1, 2].map((n, position) => ({
  id: `card-${n}`, position, layoutType: 'IMAGE_FULL_WIDTH', alignment: 'left',
  imageUrl: n === 1 ? '/images/working_a_puzzle_together.jpeg' : '/images/older_couple_smiling.jpeg',
  ...Object.fromEntries(['header', 'paragraph', 'imageAlt'].map(field => [field, { en: en.landing.infoCards[`card${n}`][field] }])),
}));

async function show(savedCards = cards, slug = 'welcome-info') {
  useSection.mockReturnValue({ loading: false, error: null, section: { title: {}, columns: 1, cards: savedCards } });
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({ resources, lng: 'en', fallbackLng: 'en', interpolation: { escapeValue: false } });
  render(<I18nextProvider i18n={i18n}><CardSection slug={slug} /></I18nextProvider>);
  return i18n;
}

describe('Welcome card translation fallback', () => {
  it('switches legacy English-only cards to Punjabi, Urdu and Hindi without reseeding', async () => {
    const original = JSON.stringify(cards);
    const i18n = await show();
    for (const language of ['pa', 'ur', 'hi', 'en']) {
      await act(() => i18n.changeLanguage(language));
      const copy = resources[language].translation.landing.infoCards;
      for (const n of [1, 2]) {
        expect(screen.getByRole('heading', { name: copy[`card${n}`].header })).toBeVisible();
        expect(screen.getByAltText(copy[`card${n}`].imageAlt)).toBeVisible();
        expect(screen.getByText(copy[`card${n}`].paragraph.split('\n\n')[0])).toBeVisible();
      }
    }
    expect(JSON.stringify(cards)).toBe(original);
  });

  it('preserves saved translations and custom English content', async () => {
    const i18n = await show([
      { ...cards[0], header: { ...cards[0].header, pa: 'Saved Punjabi heading' } },
      { ...cards[1], header: { en: 'Custom services heading' } },
    ]);
    await act(() => i18n.changeLanguage('pa'));
    expect(screen.getByRole('heading', { name: 'Saved Punjabi heading' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Custom services heading' })).toBeVisible();
  });

  it('replaces English copies stored under another language', async () => {
    const i18n = await show([{ ...cards[0], header: { en: cards[0].header.en, pa: cards[0].header.en } }]);
    await act(() => i18n.changeLanguage('pa'));
    expect(screen.getByRole('heading', { name: pa.landing.infoCards.card1.header })).toBeVisible();
  });

  it('does not substitute welcome copy in another section', async () => {
    const i18n = await show(cards, 'custom-info');
    await act(() => i18n.changeLanguage('pa'));
    expect(screen.getByRole('heading', { name: cards[0].header.en })).toBeVisible();
  });

  it('supports blank entries, legacy strings and regional language codes', async () => {
    const i18n = await show([{ ...cards[0], header: cards[0].header.en, paragraph: { ...cards[0].paragraph, pa: ' ' } }]);
    await act(() => i18n.changeLanguage('pa-IN'));
    expect(screen.getByRole('heading', { name: pa.landing.infoCards.card1.header })).toBeVisible();
    expect(screen.getByText(pa.landing.infoCards.card1.paragraph)).toBeVisible();
  });

  it('does not translate unknown image cards by their position', async () => {
    const i18n = await show([{ ...cards[0], imageUrl: '/images/custom.jpeg' }]);
    await act(() => i18n.changeLanguage('pa'));
    expect(screen.getByRole('heading', { name: cards[0].header.en })).toBeVisible();
  });

  it.each([
    ['welcome-philosophy', 'philosophyTitle', 'philosophyText'],
    ['welcome-caring-since', 'caringSinceTitle', 'caringSinceText'],
    ['welcome-about', 'aboutTitle', 'aboutText'],
  ])('provides local translations for %s', async (slug, header, paragraph) => {
    const i18n = await show([{ id: slug, position: 0, layoutType: 'HEADER_PARAGRAPH', header: { en: en.landing[header] }, paragraph: { en: en.landing[paragraph] } }], slug);
    await act(() => i18n.changeLanguage('ur'));
    expect(screen.getByRole('heading', { name: ur.landing[header] })).toBeVisible();
    expect(screen.getByText(ur.landing[paragraph])).toBeVisible();
  });
});
