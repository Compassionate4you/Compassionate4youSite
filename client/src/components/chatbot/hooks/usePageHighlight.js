// DT-808 Sprint 8
// Gandhar Tare
// Reads the highlight the chatbot asked for (router state `chatbotHighlight`)
// and highlights it on the page that just opened.
//
// Some sections (the service and hospice cards, for example) load from the
// database after the page renders, so the hook keeps watching the page for a
// few seconds and re-applies the highlight as content arrives.
//
// Highlights are cleared when the user moves to another page, presses Esc,
// or uses the "Clear highlights" button (`clear`).

import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getHighlight, highlightPhrasesKey } from '../data/highlights'
import {
  applyRanges,
  clearHighlights,
  collectRanges,
  scrollToRange
} from '../engine/pageHighlighter'

export const WATCH_MS = 5000

// Phrases for the current language, plus English ones for any part of the
// page that is still showing English text.
// DT-808 Sprint 9: also the full translated text of each `phraseKeys` entry.
export function phrasesFor (spec, id, t, i18n) {
  const asList = (value) => (Array.isArray(value) ? value : [])
  const english = typeof i18n?.getFixedT === 'function' ? i18n.getFixedT('en') : null
  const found = []

  if (spec.phrases) {
    const key = highlightPhrasesKey(id)
    found.push(...asList(t(key, { returnObjects: true })))
    if (english) found.push(...asList(english(key, { returnObjects: true })))
  }

  for (const key of spec.phraseKeys || []) {
    for (const translate of english ? [t, english] : [t]) {
      const value = translate(key, { returnObjects: true })
      // A missing key comes back as the key itself; skip it.
      if (Array.isArray(value)) found.push(...value)
      else if (typeof value === 'string' && value !== key) found.push(value)
    }
  }

  return [...new Set(found.filter((p) => typeof p === 'string' && p.trim()))]
}

export function usePageHighlight () {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [isActive, setIsActive] = useState(false)
  const highlightId = location.state?.chatbotHighlight
  const language = i18n?.language

  useEffect(() => {
    const spec = highlightId ? getHighlight(highlightId) : null
    if (!spec) {
      clearHighlights()
      setIsActive(false)
      return undefined
    }

    const target = { selectors: spec.selectors, phrases: phrasesFor(spec, highlightId, t, i18n) }
    let firstRange = null

    const update = () => {
      const ranges = collectRanges(target)
      applyRanges(ranges)
      setIsActive(ranges.length > 0)
      // Scroll again only if an earlier part of the page has loaded since.
      const first = ranges[0]
      if (first && (!firstRange || first.startContainer !== firstRange.startContainer)) {
        firstRange = first
        scrollToRange(first)
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
      setIsActive(false)
    }
    // location.key changes on every navigation, even back to the same page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, highlightId, language])

  // Drops the highlight from the router state too, so a page refresh does
  // not bring it back.
  const clear = useCallback(() => {
    navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: null })
  }, [navigate, location.pathname, location.search, location.hash])

  useEffect(() => {
    if (!isActive) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') clear()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isActive, clear])

  return { isActive, clear }
}

export default usePageHighlight
