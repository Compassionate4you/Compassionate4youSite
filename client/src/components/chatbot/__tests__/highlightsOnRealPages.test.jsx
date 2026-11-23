// DT-808 Sprint 9
// Gandhar Tare
// Renders the real Home Health and Hospice pages (the DT-902 layouts) with
// the real translations and checks every chatbot highlight still finds its
// text on them, in English and Spanish. This is the check that broke when the
// pages were rebuilt, so it guards against it happening again.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import i18next from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { act, cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import DynamicSectionRenderer from '../../modular/DynamicSectionRenderer'
import { highlights } from '../data/highlights'
import { phrasesFor } from '../hooks/usePageHighlight'
import { findPhraseRanges } from '../engine/pageHighlighter'

vi.mock('react-i18next', async () => vi.importActual('react-i18next'))

const here = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.resolve(here, '../../../locales')
const load = (lng) => JSON.parse(fs.readFileSync(path.join(localesDir, lng, 'translation.json'), 'utf8'))

const SERVICE_KEYS = ['doctors', 'pt', 'ot', 'nurses', 'st', 'chha', 'msw', 'multilingual']

const PAGE_FOR = {
  homeHealthServices: 'homeHealth',
  homeHealthStaff: 'homeHealth',
  homeHealthAtHome: 'homeHealth',
  hospiceOverview: 'hospice',
  hospiceFamily: 'hospice'
}

let i18n

beforeAll(async () => {
  i18n = i18next.createInstance()
  await i18n.use(initReactI18next).init({
    resources: { en: { translation: load('en') }, es: { translation: load('es') } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    showSupportNotice: false
  })
})

function buildReferenceItems (t, base, count) {
  return Array.from({ length: count }, (_, index) => {
    const key = `card${index + 1}`
    const description = t(`${base}.cards.${key}.description`, { returnObjects: true })
    const clean = text => text.replace(/^\s*-\s*/, '')
    return {
      id: key,
      title: t(`${base}.cards.${key}.title`),
      description: typeof description === 'string' ? description : clean(description.top),
      listItems: typeof description === 'object'
        ? Object.entries(description).filter(([name]) => name.startsWith('list')).map(([, text]) => clean(text))
        : undefined
    }
  })
}

function buildSections (page, t) {
  if (page === 'homeHealth') {
    return [
      { id: 'sec-hh-hero', layout: 'HERO_SECTION', content: { header: t('homeHealth.title'), text: t('homeHealth.subtitle'), heroVariant: 'split', heroTone: 'teal' } },
      { id: 'sec-hh-services', layout: 'HEADER_CARDS', content: { header: t('homeHealth.servicesHeading'), items: SERVICE_KEYS.map(key => ({ id: key, title: t(`homeHealth.services.${key}`) })) } },
      { id: 'sec-hh-advantages', layout: 'HEADER_CARDS', content: { header: t('homeHealthPage.advantagesTitle'), items: t('homeHealthPage.advantages', { returnObjects: true }).map((description, idx) => ({ id: `adv-${idx}`, description })) } },
      { id: 'sec-hh-specialties', layout: 'HEADER_CARDS', content: { header: t('homeHealthPage.specialtyTitle'), items: t('homeHealthPage.specialties', { returnObjects: true }).map((title, idx) => ({ id: `spec-${idx}`, title })) } },
      { id: 'sec-hh-cta', layout: 'PAGE_CTA', content: { header: t('homeHealthPage.ctaTitle'), text: t('homeHealthPage.ctaDescription') } }
    ]
  }
  return [
    { id: 'sec-hospice-hero', layout: 'HERO_SECTION', content: { header: t('hospice.blurb.title'), text: t('hospice.blurb.description'), heroVariant: 'split', heroTone: 'forest' } },
    { id: 'sec-hospice-understanding', layout: 'HEADER_STACK', content: { header: t('hospice.understanding.title'), items: buildReferenceItems(t, 'hospice.understanding', 5) } },
    { id: 'sec-hospice-benefits', layout: 'HEADER_CARDS', content: { header: t('hospice.careAndBenefits.title'), items: buildReferenceItems(t, 'hospice.careAndBenefits', 6) } },
    { id: 'sec-hospice-comprehensive', layout: 'HEADER_CARDS', content: { header: t('hospice.comprehensiveServices.title'), items: buildReferenceItems(t, 'hospice.comprehensiveServices', 6) } },
    { id: 'sec-hospice-above-beyond', layout: 'HEADER_STACK', content: { header: t('hospice.aboveAndBeyond.title'), text: t('hospice.aboveAndBeyond.description'), items: Array.from({ length: 7 }, (_, idx) => ({ id: `ab-${idx}`, title: t(`hospice.aboveAndBeyond.cards.card${idx + 1}`) })) } },
    { id: 'sec-hospice-process', layout: 'TIMELINE_SECTION', content: { header: t('hospice.hospiceProcess.title'), items: buildReferenceItems(t, 'hospice.hospiceProcess', 5) } },
    { id: 'sec-hospice-contact', layout: 'PAGE_CTA', content: { header: t('hospice.hospiceContact.title'), text: t('hospice.hospiceContact.description') } }
  ]
}

function renderPage (page) {
  const t = i18n.getFixedT(i18n.language)
  const sections = buildSections(page, t)
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        {sections.map((section) => (
          <DynamicSectionRenderer key={section.id} config={section} />
        ))}
      </MemoryRouter>
    </I18nextProvider>
  )
}

describe.each(['en', 'es'])('chatbot highlights on the real pages (%s)', (language) => {
  it.each(Object.keys(PAGE_FOR))('every %s phrase is found on its page', async (id) => {
    await act(async () => { await i18n.changeLanguage(language) })
    renderPage(PAGE_FOR[id])

    const t = i18n.getFixedT(language)
    // Only this language's phrases: each one must be on the page.
    const phrases = phrasesFor(highlights[id], id, t, null)
    expect(phrases.length, id).toBeGreaterThan(0)

    const missing = phrases.filter((phrase) => findPhraseRanges([phrase]).length === 0)
    expect(missing, `${language} ${id} not on page`).toEqual([])

    cleanup()
  })
})

describe('what the services question highlights', () => {
  it('marks the service names, not the whole cards', async () => {
    await act(async () => { await i18n.changeLanguage('en') })
    renderPage('homeHealth')

    const t = i18n.getFixedT('en')
    const ranges = findPhraseRanges(phrasesFor(highlights.homeHealthServices, 'homeHealthServices', t, null))
    const marked = ranges.map((r) => r.toString())

    expect(marked).toContain(t('homeHealth.services.nurses'))
    expect(marked).toContain(t('homeHealthPage.specialties', { returnObjects: true })[0])
    // Nothing longer than a heading or list item is marked.
    for (const text of marked) expect(text.length).toBeLessThan(80)

    cleanup()
  })
})
