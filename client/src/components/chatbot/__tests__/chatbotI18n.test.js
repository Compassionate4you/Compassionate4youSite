// DT-628: every piece of chatbot text must follow the site's language,
// including the FAQ question bank and the backend placeholder reply.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { faq, faqQuestionKey, faqAnswerKey } from '../data/faq'
import { buildResponse } from '../engine/responseBuilder'
import { matchFaqById } from '../engine/matcher'

const here = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.resolve(here, '../../../locales')
const LOCALES = ['en', 'es', 'pa', 'hi']

const translations = Object.fromEntries(
  LOCALES.map((loc) => [
    loc,
    JSON.parse(
      fs.readFileSync(path.join(localesDir, loc, 'translation.json'), 'utf8')
    )
  ])
)

function lookup (locale, dottedKey) {
  return dottedKey.split('.').reduce(
    (node, part) => (node && typeof node === 'object' ? node[part] : undefined),
    translations[locale]
  )
}

describe('FAQ content is translatable', () => {
  it('the question bank holds no hard-coded display text', () => {
    for (const entry of faq) {
      expect(entry.question).toBeUndefined()
      expect(entry.answer).toBeUndefined()
    }
  })

  it('every entry still has an id, keywords and a link field', () => {
    for (const entry of faq) {
      expect(typeof entry.id).toBe('string')
      expect(Array.isArray(entry.keywords)).toBe(true)
      expect(entry).toHaveProperty('link')
    }
  })

  it.each(LOCALES)('every question resolves in %s', (locale) => {
    for (const entry of faq) {
      const value = lookup(locale, faqQuestionKey(entry.id))
      expect(value, `${locale}: ${entry.id}`).toBeTruthy()
    }
  })

  it.each(LOCALES)('every answer resolves in %s', (locale) => {
    for (const entry of faq) {
      const value = lookup(locale, faqAnswerKey(entry.id))
      expect(value, `${locale}: ${entry.id}`).toBeTruthy()
    }
  })

  it('translations actually differ between languages', () => {
    // Guards against a locale being filled in with copied English.
    const id = faq[0].id
    const en = lookup('en', faqQuestionKey(id))
    const es = lookup('es', faqQuestionKey(id))
    expect(es).not.toBe(en)
  })

  it('no locale is missing an entry the others have', () => {
    const keysPerLocale = LOCALES.map(
      (loc) => Object.keys(translations[loc].chatbot.faq || {}).sort().join(',')
    )
    expect(new Set(keysPerLocale).size).toBe(1)
  })
})

describe('responseBuilder returns keys, not text', () => {
  it('an FAQ intent yields a translation key', () => {
    const intent = { kind: 'faq', entry: faq[0] }
    const reply = buildResponse(intent)

    expect(reply.textKey).toBe(faqAnswerKey(faq[0].id))
    expect(reply.text).toBeUndefined()
  })

  it('the key it returns resolves in every locale', () => {
    const reply = buildResponse({ kind: 'faq', entry: faq[0] })
    for (const locale of LOCALES) {
      expect(lookup(locale, reply.textKey), locale).toBeTruthy()
    }
  })

  it('an entry with a link still gets its action button', () => {
    const withLink = faq.find((e) => e.link)
    const reply = buildResponse({ kind: 'faq', entry: withLink })

    expect(reply.actionButtons).toHaveLength(1)
    expect(reply.actionButtons[0].actionId).toBe('navigate')
  })

  it('an entry without a link gets no buttons', () => {
    const withoutLink = faq.find((e) => !e.link)
    const reply = buildResponse({ kind: 'faq', entry: withoutLink })

    expect(reply.actionButtons).toEqual([])
  })
})

describe('FAQ list selection works in any language', () => {
  it('resolves an entry by id rather than by matching display text', () => {
    // This is what makes a Spanish question answerable: the click carries the
    // id, so it never depends on the English keywords.
    for (const entry of faq) {
      const intent = matchFaqById(entry.id)
      expect(intent, entry.id).not.toBeNull()
      expect(intent.entry.id).toBe(entry.id)
    }
  })

  it('returns null for an unknown id', () => {
    expect(matchFaqById('no-such-entry')).toBeNull()
  })
})

describe('backend placeholder reply is translatable', () => {
  it.each(LOCALES)('resolves in %s', (locale) => {
    expect(lookup(locale, 'chatbot.responses.placeholder')).toBeTruthy()
  })

  it('the controller returns a key instead of English text', () => {
    const controller = fs.readFileSync(
      path.resolve(here, '../../../../../server/src/controllers/chatbotController.js'),
      'utf8'
    )
    expect(controller).toContain('chatbot.responses.placeholder')
    expect(controller).not.toContain('Got your message.')
  })
})

describe('chatbot UI chrome is translatable', () => {
  const chromeKeys = [
    'chatbot.title',
    'chatbot.placeholder',
    'chatbot.send',
    'chatbot.close',
    'chatbot.emptyState',
    'chatbot.faqButton',
    'chatbot.faqIntro',
    'chatbot.faqLinks.homeHealth',
    'chatbot.faqLinks.hospice',
    'chatbot.faqLinks.locations',
    'chatbot.faqLinks.schedule'
  ]

  it.each(LOCALES)('every chrome string resolves in %s', (locale) => {
    for (const key of chromeKeys) {
      expect(lookup(locale, key), `${locale}: ${key}`).toBeTruthy()
    }
  })
})
