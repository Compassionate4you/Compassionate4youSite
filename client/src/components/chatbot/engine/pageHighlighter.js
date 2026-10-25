// DT-808 Sprint 8
// Gandhar Tare
// Highlights parts of a page the chatbot sent the user to.
//
// Uses the CSS Custom Highlight API: text is coloured through ranges
// registered with the browser, without adding or moving any DOM nodes, so
// React never sees a change it did not make. Browsers without the API get
// an outline class on the elements instead.

export const HIGHLIGHT_NAME = 'chatbot-highlight'
export const FALLBACK_CLASS = 'chatbot-highlight-fallback'

export function supportsHighlightApi (win = globalThis) {
  return Boolean(win.CSS && win.CSS.highlights && typeof win.Highlight === 'function')
}

// Elements matching any selector, in page order, without duplicates.
export function findTargets (selectors, root = document) {
  if (!root || !Array.isArray(selectors) || selectors.length === 0) return []
  const found = new Set()
  for (const selector of selectors) {
    root.querySelectorAll(selector).forEach((el) => found.add(el))
  }
  return Array.from(found).sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  )
}

// One range per non-blank text node inside the elements.
export function textRangesFor (elements, doc = document) {
  const ranges = []
  for (const el of elements) {
    const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      if (node.textContent.trim()) {
        const range = doc.createRange()
        range.selectNodeContents(node)
        ranges.push(range)
      }
      node = walker.nextNode()
    }
  }
  return ranges
}

let fallbackElements = []

export function clearHighlights (win = globalThis) {
  if (supportsHighlightApi(win)) {
    win.CSS.highlights.delete(HIGHLIGHT_NAME)
  }
  fallbackElements.forEach((el) => el.classList.remove(FALLBACK_CLASS))
  fallbackElements = []
}

// Highlights the elements. Returns how many were highlighted.
export function applyHighlights (elements, win = globalThis) {
  clearHighlights(win)
  if (elements.length === 0) return 0

  if (supportsHighlightApi(win)) {
    const ranges = textRangesFor(elements, win.document)
    win.CSS.highlights.set(HIGHLIGHT_NAME, new win.Highlight(...ranges))
  } else {
    elements.forEach((el) => el.classList.add(FALLBACK_CLASS))
    fallbackElements = elements
  }
  return elements.length
}

export function scrollToFirst (elements) {
  const first = elements[0]
  if (first && typeof first.scrollIntoView === 'function') {
    first.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
