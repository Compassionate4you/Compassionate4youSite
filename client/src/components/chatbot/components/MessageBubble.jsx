// Renders a single user or bot message bubble.

import { useTranslation } from 'react-i18next'
import ActionButton from './ActionButton'
import { faqQuestionKey } from '../data/faq'

// DT-904: the words to show for a message in the current language.
// Bot replies are stored as translation keys and FAQ questions as their id,
// so both follow the language setting, including older messages. Questions
// the user typed are shown exactly as typed.
// Replies saved before the "didn't understand" message existed used a
// "coming soon" placeholder; they now show the new message instead.
const REPLACED_KEYS = {
  'chatbot.responses.placeholder': 'chatbot.responses.noMatch'
}

export function messageText (message, t) {
  if (message.textKey) return t(REPLACED_KEYS[message.textKey] || message.textKey)
  if (message.faqId) {
    return t(faqQuestionKey(message.faqId), { defaultValue: message.text || '' })
  }
  return message.text || ''
}

function MessageBubble ({ message, onOpenFaq }) {
  const { t } = useTranslation()
  const isUser = message.sender === 'user'

  const text = messageText(message, t)
  const actions = Array.isArray(message.actionButtons)
    ? message.actionButtons
    : []

  return (
    <div className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--bot'}`}>
      <div className='chat-bubble__text'>{text}</div>
      {actions.length > 0 && (
        <div className='chat-bubble__actions'>
          {actions.map((action, idx) => (
            <ActionButton
              key={`${action.actionId}-${idx}`}
              labelKey={action.labelKey}
              label={action.label}
              actionId={action.actionId}
              to={action.to}
              highlight={action.highlight}
              onOpenFaq={onOpenFaq}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MessageBubble
