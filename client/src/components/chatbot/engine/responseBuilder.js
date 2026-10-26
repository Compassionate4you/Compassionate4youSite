// Builds bot reply objects from matcher intents. Returns null for unknown
// intents (caller falls back to backend).
import { faqAnswerKey } from '../data/faq'
import { navButtonKey, navReplyKey } from '../data/navigation'

export function buildResponse (intent) {
  if (!intent) return null

  if (intent.kind === 'accessibility') {
    return {
      textKey: intent.command.replyKey,
      actionButtons: [
        {
          labelKey: intent.command.labelKey,
          actionId: intent.actionId
        }
      ]
    }
  }

  // DT-423: FAQ answers are looked up by translation key so they follow the
  // site's language, plus an optional link to the relevant page.
  // DT-808: the link carries what to highlight once the page opens.
  if (intent.kind === 'faq') {
    const { entry } = intent
    return {
      textKey: faqAnswerKey(entry.id),
      actionButtons: entry.link
        ? [
            {
              labelKey: entry.link.labelKey,
              actionId: 'navigate',
              to: entry.link.to,
              highlight: entry.link.highlight
            }
          ]
        : []
    }
  }

  // DT-171 / DT-807: a short description of the page in the chat, plus a
  // button that goes there.
  if (intent.kind === 'navigate') {
    const { page } = intent
    return {
      textKey: navReplyKey(page.id),
      actionButtons: [
        {
          labelKey: navButtonKey(page.id),
          actionId: 'navigate',
          to: page.to
        }
      ]
    }
  }

  return null
}

export default buildResponse
