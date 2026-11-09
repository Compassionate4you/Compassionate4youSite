// Intent matcher. Handles accessibility commands (DT-335), the FAQ question
// bank (DT-423) and page navigation (DT-171). Returns an intent object or
// null (null = send to backend).
import { accessibilityCommands } from '../data/accessibilityCommands'
import { faq } from '../data/faq'
import { navigationCues, pages } from '../data/navigation'

// Extra weight for a page match when the message asks to go somewhere.
const NAVIGATION_CUE_BONUS = 10

function normalize (text) {
  return String(text || '').toLowerCase().trim()
}

// DT-171: whole words and phrases only, so 'call' does not match 'recall',
// 'where' does not match 'anywhere', and 'log in' is not read as a location.
function containsPhrase (text, phrase) {
  const escaped = phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, 'u').test(text)
}

// Sum of the lengths of the keywords found, so longer and more specific
// phrases count for more.
function scoreKeywords (text, keywords) {
  let score = 0
  for (const keyword of keywords) {
    if (containsPhrase(text, keyword)) score += keyword.length
  }
  return score
}

function matchAccessibility (text) {
  for (const command of accessibilityCommands) {
    for (const trigger of command.triggers) {
      if (text.includes(trigger.toLowerCase())) {
        return {
          kind: 'accessibility',
          actionId: command.actionId,
          command
        }
      }
    }
  }
  return null
}

// DT-423: score each entry by how many of its keywords appear in the message.
// Longer keywords win ties so 'home health vs' beats a bare 'health'.
function matchFaq (text) {
  let best = null
  let bestScore = 0

  for (const entry of faq) {
    const score = scoreKeywords(text, entry.keywords)
    if (score > bestScore) {
      best = entry
      bestScore = score
    }
  }

  return best ? { kind: 'faq', entry: best, score: bestScore } : null
}

// DT-171: which page, if any, the message names.
function matchPage (text) {
  let best = null
  let bestScore = 0

  for (const page of pages) {
    const score = scoreKeywords(text, page.keywords)
    if (score > bestScore) {
      best = page
      bestScore = score
    }
  }

  return best ? { kind: 'navigate', page: best, score: bestScore } : null
}

function hasNavigationCue (text) {
  return navigationCues.some((cue) => containsPhrase(text, cue))
}

// DT-171: an FAQ answers a question; a page match takes the user somewhere.
// "What home health services do you offer?" names a page but is a question,
// so the FAQ wins unless the message also asks to go somewhere ("take me
// to...", "where do I..."). When the FAQ already links to the page asked
// for, the FAQ wins, since it gives the answer, the button and the
// highlights.
function chooseFaqOrPage (text) {
  const faqMatch = matchFaq(text)
  const pageMatch = matchPage(text)

  if (!pageMatch) return faqMatch
  if (!faqMatch) return pageMatch
  if (!hasNavigationCue(text)) return faqMatch
  if (faqMatch.entry.link?.to === pageMatch.page.to) return faqMatch

  return pageMatch.score + NAVIGATION_CUE_BONUS > faqMatch.score ? pageMatch : faqMatch
}

export function matchIntent (message) {
  const text = normalize(message)
  if (!text) return null

  // Accessibility commands take priority - they are direct instructions.
  const intent = matchAccessibility(text) || chooseFaqOrPage(text)
  if (!intent) return null

  // The score is only used for choosing.
  const { score, ...rest } = intent
  return rest
}

// DT-420: used by the FAQ button to look an entry up directly.
export function getFaqById (id) {
  return faq.find((entry) => entry.id === id) || null
}

// DT-420: clicking a question in the FAQ list resolves by id, so the answer
// does not depend on the displayed language matching the English keywords.
export function matchFaqById (id) {
  const entry = getFaqById(id)
  return entry ? { kind: 'faq', entry } : null
}

export default matchIntent
