// DT-808 Sprint 8
// Gandhar Tare
// What to highlight on a page after the chatbot sends the user there.
//
// Each entry lists CSS selectors for the parts of the page that answer the
// question. The highlighter marks the text inside them, so it works in every
// language and for cards loaded from the database. If a page's markup
// changes, update the selectors here (chatbotHighlights.test.js checks every
// FAQ highlight points to an entry in this list).

export const highlights = {
  // "What home health services do you offer?"
  homeHealthServices: {
    selectors: ['.services-section .card', '.specialty-card']
  },
  // "Who will be providing the care?" - the service cards are the staff roles.
  homeHealthStaff: {
    selectors: ['.services-section .card']
  },
  // "Do you provide care at home?"
  homeHealthAtHome: {
    selectors: ['.hero-description']
  },
  // "What is the difference between home health and hospice?"
  hospiceOverview: {
    selectors: ['.HospiceDescription', '.HospiceBanner + .card-section .card']
  },
  // "Do you offer support for family members?"
  hospiceFamily: {
    selectors: ['.HospiceDescription', '.HospiceAboveAndBeyondText']
  },
  // "What areas do you serve?"
  officeLocation: {
    selectors: ['.map-section__title', '.map-section__directions']
  },
  // "How do I contact you?" - phone, email, fax and address on the home page.
  contactInfo: {
    selectors: ['.contact-info']
  },
  // "What are your hours?" - the footer is on every page.
  officeHours: {
    selectors: ['.footer__hours-list']
  }
}

export function getHighlight (id) {
  return highlights[id] || null
}

export default highlights
