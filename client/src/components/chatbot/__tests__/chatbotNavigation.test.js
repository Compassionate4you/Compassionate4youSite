// DT-171 / DT-807 / DT-808 Sprint 8
// Gandhar Tare
// Which page or answer the chatbot picks for a message, and the buttons it
// returns. Run with: cd client && npx vitest run src/components/chatbot
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import i18next from 'i18next'
import { beforeAll, describe, expect, it } from 'vitest'

import { matchIntent } from '../engine/matcher'
import { buildResponse } from '../engine/responseBuilder'
import { faq } from '../data/faq'
import { highlights } from '../data/highlights'
import { navButtonKey, navReplyKey, pages } from '../data/navigation'

const here = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(here, '../../..')
const LOCALES = ['en', 'es', 'pa', 'hi']

// Shorthand: what the chatbot would do with a message.
function outcome (message) {
  const intent = matchIntent(message)
  if (!intent) return null
  if (intent.kind === 'navigate') return `page:${intent.page.id}`
  if (intent.kind === 'faq') return `faq:${intent.entry.id}`
  return `${intent.kind}:${intent.actionId}`
}

describe('asking to go to a page (DT-171)', () => {
  it.each([
    ['Take me to the hospice page', 'page:hospice'],
    ['Take me to the home health page', 'page:homeHealth'],
    ['Go to the home page', 'page:home'],
    ['Where do I log in?', 'page:login'],
    ['take me to my patient portal', 'page:portal'],
    ['How do I create an account', 'page:signup'],
    ['How do I sign up?', 'page:signup'],
    ['I forgot my password', 'page:forgotPassword'],
    ['how do i reset my password', 'page:forgotPassword'],
    ['hospice', 'page:hospice'],
    ['open the scheduling page', 'page:schedule']
  ])('"%s" -> %s', (message, expected) => {
    expect(outcome(message)).toBe(expected)
  })

  it('handles the examples from the ticket', () => {
    // Both reach the Locations page. The FAQ answer is used because it
    // links to the same page and also gives the address in the chat.
    for (const message of ['How can I see their locations', 'How can I access their locations page']) {
      const reply = buildResponse(matchIntent(message))
      expect(reply.actionButtons[0].to, message).toBe('/locations')
    }
  })
})

describe('questions still get answers, not just a link', () => {
  it.each([
    ['What home health services do you offer?', 'faq:services-offered'],
    ['What is the difference between home health and hospice?', 'faq:home-health-vs-hospice'],
    ['I want to book an appointment', 'faq:schedule-appointment'],
    ['What are your office hours?', 'faq:hours-availability'],
    ['Are you open on the weekend?', 'faq:hours-availability'],
    ['How do I contact you?', 'faq:contact'],
    ["What's your email address?", 'faq:contact'],
    ['Take me to the contact page', 'faq:contact'],
    ['Show me your home health services', 'faq:services-offered'],
    ['Do you take Medicare?', 'faq:cost-insurance']
  ])('"%s" -> %s', (message, expected) => {
    expect(outcome(message)).toBe(expected)
  })
})

describe('whole-word matching', () => {
  it('does not treat "log in" as a question about locations', () => {
    expect(outcome('Where do I log in?')).not.toBe('faq:service-area')
  })

  it('does not match a keyword inside a longer word', () => {
    // 'call' is a contact keyword; 'where' is a service-area keyword.
    expect(outcome('I cannot recall')).toBeNull()
    expect(outcome('anywhere')).toBeNull()
  })

  it('still lets accessibility commands win', () => {
    expect(outcome('take me to dark mode')).toBe('accessibility:toggleDarkMode')
  })

  it('returns null for an empty message or one with no match', () => {
    expect(matchIntent('')).toBeNull()
    expect(matchIntent('   ')).toBeNull()
    expect(matchIntent('purple elephants')).toBeNull()
  })
})

describe('buttons (DT-807)', () => {
  it('a page match returns a reply and a button to that page', () => {
    const reply = buildResponse(matchIntent('take me to the hospice page'))

    expect(reply.textKey).toBe(navReplyKey('hospice'))
    expect(reply.actionButtons).toEqual([
      { labelKey: navButtonKey('hospice'), actionId: 'navigate', to: '/hospice' }
    ])
  })

  it('every page links to a route that exists in AppRoutes', () => {
    const routes = fs.readFileSync(path.join(srcDir, 'routes/AppRoutes.jsx'), 'utf8')
    for (const page of pages) {
      expect(routes, page.id).toContain(`path='${page.to}'`)
    }
  })

  it('every FAQ link goes to a route that exists in AppRoutes', () => {
    const routes = fs.readFileSync(path.join(srcDir, 'routes/AppRoutes.jsx'), 'utf8')
    for (const entry of faq.filter((e) => e.link?.to)) {
      expect(routes, entry.id).toContain(`path='${entry.link.to}'`)
    }
  })

  it('no page links to the admin area', () => {
    for (const page of pages) {
      expect(page.to.startsWith('/admin')).toBe(false)
    }
  })
})

describe('highlights (DT-808)', () => {
  it('the services question highlights the services on the Home Health page', () => {
    const reply = buildResponse(matchIntent('What home health services do you offer?'))

    expect(reply.actionButtons[0]).toMatchObject({
      to: '/home-health',
      highlight: 'homeHealthServices'
    })
  })

  it('every FAQ highlight refers to an entry in highlights.js', () => {
    for (const entry of faq.filter((e) => e.link?.highlight)) {
      expect(highlights[entry.link.highlight], entry.id).toBeDefined()
      expect(highlights[entry.link.highlight].selectors.length, entry.id).toBeGreaterThan(0)
    }
  })

  it('every highlight selector is valid CSS', () => {
    for (const [id, spec] of Object.entries(highlights)) {
      for (const selector of spec.selectors) {
        expect(() => document.querySelector(selector), `${id}: ${selector}`).not.toThrow()
      }
    }
  })

  it('the hours button stays on the current page', () => {
    const reply = buildResponse(matchIntent('What are your hours?'))

    expect(reply.actionButtons[0].to).toBeUndefined()
    expect(reply.actionButtons[0].highlight).toBe('officeHours')
  })
})

describe('chatbot text resolves in every language', () => {
  const translations = Object.fromEntries(
    LOCALES.map((loc) => [
      loc,
      JSON.parse(fs.readFileSync(path.join(srcDir, 'locales', loc, 'translation.json'), 'utf8'))
    ])
  )
  let i18n

  beforeAll(async () => {
    // A real i18next instance, so nested $t(...) references are resolved.
    i18n = i18next.createInstance()
    await i18n.init({
      resources: Object.fromEntries(LOCALES.map((loc) => [loc, { translation: translations[loc] }])),
      lng: 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      showSupportNotice: false
    })
  })

  const navKeys = pages.flatMap((page) => [navReplyKey(page.id), navButtonKey(page.id)])
  const faqLinkKeys = [...new Set(faq.filter((e) => e.link).map((e) => e.link.labelKey))]

  it.each(LOCALES)('every page reply and button exists in %s', (locale) => {
    for (const key of [...navKeys, ...faqLinkKeys]) {
      expect(i18n.exists(key, { lng: locale, fallbackLng: false }), `${locale}: ${key}`).toBe(true)
    }
  })

  it.each(LOCALES)('no reply in %s is left with an unresolved $t(...)', (locale) => {
    const t = i18n.getFixedT(locale)
    const keys = [...navKeys, ...faq.map((e) => `chatbot.faq.${e.id}.answer`)]
    for (const key of keys) {
      expect(t(key), `${locale}: ${key}`).not.toContain('$t(')
    }
  })

  it('page replies quote the page itself rather than new wording', () => {
    const t = i18n.getFixedT('en')
    expect(t(navReplyKey('hospice'))).toContain(t('hospice.blurb.description'))
    expect(t(navReplyKey('homeHealth'))).toContain(t('homeHealth.subtitle'))
    expect(t(navReplyKey('locations'))).toContain(t('locations.address1'))
  })

  it('FAQ answers use the phone number, address and hours shown on the site', () => {
    const t = i18n.getFixedT('en')
    expect(t('chatbot.faq.contact.answer')).toContain(t('landing.contactPhone'))
    expect(t('chatbot.faq.service-area.answer')).toContain(t('locations.address1'))
    expect(t('chatbot.faq.hours-availability.answer')).toContain(t('footer.weekdayHours'))
    expect(t('chatbot.faq.hours-availability.answer')).toContain(t('footer.saturdayHours'))
  })

  it('the service area answer no longer names a city the site never mentions', () => {
    for (const locale of LOCALES) {
      const answer = i18n.getFixedT(locale)('chatbot.faq.service-area.answer')
      expect(answer, locale).not.toMatch(/Sacramento|सैक्रामेंटो|ਸੈਕਰਾਮੈਂਟੋ/)
    }
  })
})
