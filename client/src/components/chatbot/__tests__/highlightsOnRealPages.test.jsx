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

import HomeHealthSections from '../../modular/HomeHealthSections'
import HospiceSections from '../../modular/HospiceSections'
import { highlights } from '../data/highlights'
import { phrasesFor } from '../hooks/usePageHighlight'
import { findPhraseRanges } from '../engine/pageHighlighter'

vi.mock('react-i18next', async () => vi.importActual('react-i18next'))

const here = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.resolve(here, '../../../locales')
const load = (lng) => JSON.parse(fs.readFileSync(path.join(localesDir, lng, 'translation.json'), 'utf8'))

// The section ids the database seeds for these pages.
const HOME_HEALTH = ['sec-hh-hero', 'sec-hh-services', 'sec-hh-advantages', 'sec-hh-specialties', 'sec-hh-cta']
const HOSPICE = [
  'sec-hospice-hero', 'sec-hospice-understanding', 'sec-hospice-benefits',
  'sec-hospice-comprehensive', 'sec-hospice-above-beyond', 'sec-hospice-process', 'sec-hospice-contact'
]

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

function renderPage (page) {
  const Sections = page === 'homeHealth' ? HomeHealthSections : HospiceSections
  const ids = page === 'homeHealth' ? HOME_HEALTH : HOSPICE
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <Sections sections={ids.map((id) => ({ id, layout: 'X', content: {} }))} />
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
