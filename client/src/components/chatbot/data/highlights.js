// DT-808 Sprint 8
// Gandhar Tare
// What to highlight on a page after the chatbot sends the user there.
//
// Two kinds of target, so only the useful words are marked rather than
// whole cards:
// - `selectors`: short elements highlighted in full, such as service names,
//   specialty items, contact details and office hours.
// - `phrases: true`: key phrases inside longer paragraphs. The phrases live
//   in the locale files under `chatbot.highlightPhrases.<id>` and are copied
//   word for word from the page text in each language, so they work in every
//   language the page is shown in. chatbotHighlights.test.js checks that
//   every phrase really appears in that language's page text.

export const highlights = {
  // "What home health services do you offer?" - the service names and the
  // specialty list.
  homeHealthServices: {
    selectors: ['.services-section .card h3', '.specialty-text']
  },
  // "Who will be providing the care?" - the service names are the staff roles.
  homeHealthStaff: {
    selectors: ['.services-section .card h3']
  },
  // "Do you provide care at home?"
  homeHealthAtHome: {
    selectors: [],
    phrases: true
  },
  // "What is the difference between home health and hospice?" - key points
  // from every section of the Hospice page.
  hospiceOverview: {
    selectors: [],
    phrases: true
  },
  // "Do you offer support for family members?"
  hospiceFamily: {
    selectors: [],
    phrases: true
  },
  // "What areas do you serve?"
  officeLocation: {
    selectors: ['.map-section__title', '.map-section__directions']
  },
  // "How do I contact you?" - the phone, email, fax and address values.
  contactInfo: {
    selectors: ['.contact-info .contact-item p']
  },
  // "What are your hours?" - the footer is on every page.
  officeHours: {
    selectors: ['.footer__hours-text']
  }
}

export function getHighlight (id) {
  return highlights[id] || null
}

export function highlightPhrasesKey (id) {
  return `chatbot.highlightPhrases.${id}`
}

export default highlights
