// DT-419: FAQ question bank.
//
// Question and answer text lives in the locale files under `chatbot.faq.<id>`
// so it follows the site's language setting. This file holds only the data the
// matcher needs: the id, the keywords it matches on, and the page it links to.
//
// Keywords stay in English for now. The matcher scores against them, so a
// question typed in another language falls through to the backend rather than
// matching the wrong entry. Translating the keyword sets is follow-up work.
//
// DT-808: `highlight` names an entry in highlights.js. When the user follows
// the link, those parts of the page are highlighted.

export const faq = [
  {
    id: 'services-offered',
    keywords: ['services', 'offer', 'provide', 'what do you do', 'care types'],
    link: { labelKey: 'chatbot.faqLinks.homeHealth', to: '/home-health', highlight: 'homeHealthServices' }
  },
  {
    id: 'service-area',
    keywords: ['area', 'areas', 'location', 'locations', 'serve', 'where', 'city', 'county'],
    link: { labelKey: 'chatbot.faqLinks.locations', to: '/locations', highlight: 'officeLocation' }
  },
  {
    id: 'schedule-appointment',
    keywords: ['schedule', 'appointment', 'book', 'booking', 'visit', 'consultation'],
    link: { labelKey: 'chatbot.faqLinks.schedule', to: '/schedule' }
  },
  {
    id: 'home-health-vs-hospice',
    keywords: ['difference', 'home health vs', 'hospice vs', 'compare', 'which one'],
    link: { labelKey: 'chatbot.faqLinks.hospice', to: '/hospice', highlight: 'hospiceOverview' }
  },
  {
    id: 'cost-insurance',
    keywords: ['cost', 'price', 'pay', 'insurance', 'medicare', 'medicaid', 'coverage'],
    link: null
  },
  {
    id: 'contact',
    keywords: ['contact', 'phone', 'phone number', 'call', 'email', 'email address', 'reach', 'talk to someone'],
    // DT-171: the phone number, email and address are in the home page's
    // Contact section, not on the Locations page.
    link: { labelKey: 'chatbot.faqLinks.contact', to: '/', highlight: 'contactInfo' }
  },
  {
    id: 'getting-started',
    // 'sign up' was removed: it now goes to the create account page (navigation.js).
    keywords: ['get started', 'getting started', 'begin', 'first step', 'refer'],
    link: { labelKey: 'chatbot.faqLinks.schedule', to: '/schedule' }
  },
  {
    id: 'who-qualifies',
    keywords: ['qualify', 'qualifies', 'eligible', 'eligibility', 'requirements', 'who can'],
    link: null
  },
  {
    id: 'who-provides-care',
    keywords: [
      'who will be providing',
      'who provides',
      'caregiver',
      'nurse',
      'staff',
      'team',
      'aide',
      'therapist'
    ],
    link: { labelKey: 'chatbot.faqLinks.homeHealth', to: '/home-health', highlight: 'homeHealthStaff' }
  },
  {
    id: 'care-at-home',
    keywords: [
      'provide care at home',
      'care at home',
      'at home',
      'in home',
      'my house',
      'come to me',
      'home visit'
    ],
    link: { labelKey: 'chatbot.faqLinks.homeHealth', to: '/home-health', highlight: 'homeHealthAtHome' }
  },
  {
    id: 'hours-availability',
    keywords: ['hours', 'open', 'availability', 'weekend', 'after hours', 'when are you'],
    // DT-808: the hours are in the footer of every page, so the button stays
    // on the current page (no `to`) and highlights them.
    link: { labelKey: 'chatbot.faqLinks.hours', highlight: 'officeHours' }
  },
  {
    id: 'family-support',
    keywords: [
      'family',
      'families',
      'caregiver support',
      'support for me',
      'relatives',
      'loved one'
    ],
    link: { labelKey: 'chatbot.faqLinks.hospice', to: '/hospice', highlight: 'hospiceFamily' }
  }
]

// Translation keys for an entry's question and answer.
export function faqQuestionKey (id) {
  return `chatbot.faq.${id}.question`
}

export function faqAnswerKey (id) {
  return `chatbot.faq.${id}.answer`
}

export default faq
