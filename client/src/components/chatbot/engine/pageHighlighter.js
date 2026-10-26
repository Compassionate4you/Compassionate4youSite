// DT-808 Sprint 8
// Gandhar Tare
// Highlights parts of a page the chatbot sent the user to.
//
// Uses the CSS Custom Highlight API: text is coloured through ranges
// registered with the browser, without adding or moving any DOM nodes, so
// React never sees a change it did not make. Browsers without the API get
// an outline class on the elements that hold the text instead.

export const HIGHLIGHT_NAME = 'chatbot-highlight'
export const FALLBACK_CLASS = 'chatbot-highlight-fallback'

// Text inside these is never highlighted: the chat window repeats the
// answer, and scripts and styles are not visible text.
const SKIP_SELECTOR = '.chatbot-widget, script, style, noscript'

export function supportsHighlightApi (win = globalThis) {
  return Boolean(win.CSS && win.CSS.highlights && typeof win.Highlight === 'function')
}

// Elements matching any selector, in page order, without duplicates.
export function findTargets (selectors, root = document) {
  if (!root || !Array.isArray(selectors) || selectors.length === 0) return []
  const found = new Set()
  for (const selector of selectors) {
    root.querySelectorAll(selector).forEach((el) => {
      if (!el.closest(SKIP_SELECTOR)) found.add(el)
    })
  }
  return Array.from(found).sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  )
}

function visibleTextNodes (root, doc) {
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement && node.parentElement.closest(SKIP_SELECTOR)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT
  })
  const nodes = []
  let node = walker.nextNode()
  while (node) {
    nodes.push(node)
    node = walker.nextNode()
  }
  return nodes
}

// One range per non-blank text node inside the elements.
export function textRangesFor (elements, doc = document) {
  const ranges = []
  for (const el of elements) {
    for (const node of visibleTextNodes(el, doc)) {
      if (node.textContent.trim()) {
        const range = doc.createRange()
        range.selectNodeContents(node)
        ranges.push(range)
      }
    }
  }
  return ranges
}

// A range for every place a phrase appears, ignoring case. Only the phrase
// itself is covered, not the rest of the paragraph.
export function findPhraseRanges (phrases, root = document.body, doc = document) {
  const wanted = (Array.isArray(phrases) ? phrases : [])
    .map((p) => String(p || '').trim().toLowerCase())
    .filter(Boolean)
  if (!root || wanted.length === 0) return []

  const ranges = []
  for (const node of visibleTextNodes(root, doc)) {
    const text = node.textContent.toLowerCase()
    for (const phrase of wanted) {
      let index = text.indexOf(phrase)
      while (index !== -1) {
        const range = doc.createRange()
        range.setStart(node, index)
        range.setEnd(node, index + phrase.length)
        ranges.push(range)
        index = text.indexOf(phrase, index + phrase.length)
      }
    }
  }
  return ranges
}

export function sortRanges (ranges) {
  return [...ranges].sort((a, b) => a.compareBoundaryPoints(Range.START_TO_START, b))
}

let fallbackElements = []

export function clearHighlights (win = globalThis) {
  if (supportsHighlightApi(win)) {
    win.CSS.highlights.delete(HIGHLIGHT_NAME)
  }
  fallbackElements.forEach((el) => el.classList.remove(FALLBACK_CLASS))
  fallbackElements = []
}

// Highlights the given ranges. Returns how many there are.
export function applyRanges (ranges, win = globalThis) {
  clearHighlights(win)
  if (ranges.length === 0) return 0

  if (supportsHighlightApi(win)) {
    win.CSS.highlights.set(HIGHLIGHT_NAME, new win.Highlight(...ranges))
  } else {
    const elements = new Set(
      ranges.map((r) => r.startContainer.parentElement).filter(Boolean)
    )
    elements.forEach((el) => el.classList.add(FALLBACK_CLASS))
    fallbackElements = Array.from(elements)
  }
  return ranges.length
}

// Everything a highlight entry covers on the current page, in page order.
export function collectRanges ({ selectors = [], phrases = [] }, doc = document) {
  return sortRanges([
    ...textRangesFor(findTargets(selectors, doc), doc),
    ...findPhraseRanges(phrases, doc.body, doc)
  ])
}

export function scrollToRange (range) {
  const el = range && range.startContainer && range.startContainer.parentElement
  if (el && typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
