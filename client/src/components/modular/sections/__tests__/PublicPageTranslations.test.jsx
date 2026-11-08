import { describe, expect, it } from 'vitest'
import { getContentPageLabel } from '../../../../services/contentPageLabels'

// DT-902: Require complete localized public-page content, including arrays and form feedback.
const files = import.meta.glob('../../../../locales/*/translation.json', { eager: true, import: 'default' })
const locales = Object.fromEntries(Object.entries(files).map(([path, data]) => [path.split('/').at(-2), data]))
const namespaces = ['landing', 'homeHealth', 'homeHealthPage', 'hospice', 'faq', 'locations', 'accessibility', 'nav', 'footer']

// DT-902: Preserve each nested key and array item rather than silently relying on English fallback.
function compareShape (expected, actual, path) {
  if (Array.isArray(expected)) {
    expect(actual, path).toHaveLength(expected.length)
    expected.forEach((value, index) => compareShape(value, actual[index], `${path}.${index}`))
  } else if (expected && typeof expected === 'object') {
    for (const [key, value] of Object.entries(expected)) compareShape(value, actual?.[key], `${path}.${key}`)
  } else {
    expect(typeof actual, path).toBe(typeof expected)
    if (typeof actual === 'string') expect(actual.trim(), path).not.toBe('')
  }
}

// DT-902: Check every supported locale and translated known-page naming.
describe('public page translations', () => {
  it.each(Object.keys(locales))('%s supplies every public-page key without missing locale data', language => {
    const data = locales[language]
    for (const namespace of namespaces) compareShape(locales.en[namespace], data[namespace], `${language}.${namespace}`)
    expect(data.homeHealthPage.advantages).toHaveLength(7)
    expect(data.homeHealthPage.specialties).toHaveLength(10)
    expect(data.faq.items).toHaveLength(5)
    if (language !== 'en') {
      expect(data.hospice.understanding.cards.card1.description).not.toBe(locales.en.hospice.understanding.cards.card1.description)
      expect(data.landing.contactFormError).not.toBe(locales.en.landing.contactFormError)
      expect(data.homeHealthPage.advantages[0]).not.toBe(locales.en.homeHealthPage.advantages[0])
    }
    // DT-902: Every section introduction is localized rather than copied from English.
    const intros = [data.homeHealthPage.servicesIntro, data.homeHealthPage.advantagesIntro, data.homeHealthPage.specialtiesIntro, data.hospice.careAndBenefits, data.hospice.comprehensiveServices]
    const englishIntros = [locales.en.homeHealthPage.servicesIntro, locales.en.homeHealthPage.advantagesIntro, locales.en.homeHealthPage.specialtiesIntro, locales.en.hospice.careAndBenefits, locales.en.hospice.comprehensiveServices]
    intros.forEach((intro, index) => {
      for (const key of ['label', 'subtitle']) {
        expect(intro[key].trim()).not.toBe('')
        if (language !== 'en') expect(intro[key]).not.toBe(englishIntros[index][key])
      }
    })
    const t = key => key.split('.').reduce((value, part) => value[part], data)
    for (const id of ['welcome', 'home', 'landing']) expect(getContentPageLabel({ id }, t)).toBe(data.nav.welcome)
    expect(getContentPageLabel({ id: 'homeHealth' }, t)).toBe(data.nav.homeHealth)
    expect(getContentPageLabel({ id: 'hospice' }, t)).toBe(data.hospice.blurb.title)
    expect(getContentPageLabel({ id: 'custom', content: { title: 'Custom CMS title' } }, t)).toBe('Custom CMS title')
  })
})
