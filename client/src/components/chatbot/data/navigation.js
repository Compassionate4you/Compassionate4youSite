// DT-171 / DT-807 Sprint 8
// Gandhar Tare
// Pages the chatbot can take a user to when they ask for one ("take me to the
// hospice page", "where do I log in", "I forgot my password").
//
// Reply and button text live in the locale files under `chatbot.nav.<id>`.
// The replies reuse each page's own description through i18next nesting, so
// the chatbot only says what the page itself says. The admin pages are left
// out on purpose.
//
// Keywords are English, like the FAQ bank (see faq.js).

export const pages = [
  {
    id: 'home',
    to: '/',
    keywords: ['home page', 'homepage', 'main page', 'front page', 'landing page']
  },
  {
    id: 'homeHealth',
    to: '/home-health',
    keywords: ['home health', 'home healthcare', 'home health care']
  },
  {
    id: 'hospice',
    to: '/hospice',
    keywords: ['hospice', 'hospice care', 'end of life', 'end-of-life']
  },
  {
    id: 'locations',
    to: '/locations',
    keywords: ['location', 'locations', 'directions', 'address', 'map']
  },
  {
    id: 'schedule',
    to: '/schedule',
    keywords: ['schedule', 'scheduling', 'appointment', 'appointments', 'book']
  },
  {
    id: 'portal',
    to: '/portal',
    keywords: ['portal', 'patient portal', 'customer portal', 'my account', 'dashboard', 'my appointments']
  },
  {
    id: 'login',
    to: '/login',
    keywords: ['log in', 'login', 'sign in', 'signin', 'log on']
  },
  {
    id: 'signup',
    to: '/signup',
    keywords: ['sign up', 'signup', 'create account', 'create an account', 'make an account', 'new account', 'register']
  },
  {
    id: 'forgotPassword',
    to: '/forgot-password',
    keywords: [
      'forgot password',
      'forgot my password',
      'forgotten password',
      'reset password',
      'reset my password',
      'lost password',
      'lost my password'
    ]
  }
]

// Phrases that show the user wants to go somewhere rather than ask a question.
// A page match with one of these beats an FAQ answer on the same topic.
export const navigationCues = [
  'take me',
  'bring me',
  'send me',
  'go to',
  'get to',
  'navigate',
  'open',
  'show me',
  'where is',
  'where are',
  'where do i',
  'where can i',
  'how do i access',
  'how can i access',
  'how do i see',
  'how can i see',
  'link',
  'page'
]

export function navReplyKey (id) {
  return `chatbot.nav.${id}.reply`
}

export function navButtonKey (id) {
  return `chatbot.nav.${id}.button`
}

export function getPageById (id) {
  return pages.find((page) => page.id === id) || null
}

export default pages
