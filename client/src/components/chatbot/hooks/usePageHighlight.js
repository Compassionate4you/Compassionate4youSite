// DT-808 Sprint 8
// Gandhar Tare
// Reads the highlight the chatbot asked for (router state `chatbotHighlight`)
// and highlights it on the page that just opened.
//
// Some sections (the service cards, for example) load from the database
// after the page renders, so the hook keeps watching the page for a few
// seconds and re-applies the highlight as content arrives. Highlights are
// cleared when the user moves to another page.

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getHighlight } from '../data/highlights'
import {
  applyHighlights,
  clearHighlights,
  findTargets,
  scrollToFirst
} from '../engine/pageHighlighter'

export const WATCH_MS = 5000

export function usePageHighlight () {
  const location = useLocation()
  const highlightId = location.state?.chatbotHighlight

  useEffect(() => {
    const spec = highlightId ? getHighlight(highlightId) : null
    if (!spec) {
      clearHighlights()
      return undefined
    }

    let firstTarget = null

    const update = () => {
      const targets = findTargets(spec.selectors)
      applyHighlights(targets)
      // Scroll again only if an earlier section has loaded since.
      if (targets[0] && targets[0] !== firstTarget) {
        firstTarget = targets[0]
        scrollToFirst(targets)
      }
    }

    update()

    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    const stopWatching = setTimeout(() => observer.disconnect(), WATCH_MS)

    return () => {
      clearTimeout(stopWatching)
      observer.disconnect()
      clearHighlights()
    }
    // location.key changes on every navigation, even back to the same page.
  }, [location.key, highlightId])
}

export default usePageHighlight
