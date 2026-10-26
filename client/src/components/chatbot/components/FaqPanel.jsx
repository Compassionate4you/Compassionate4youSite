// DT-420: "Common questions" list. Clicking a question sends it through the
// normal message flow, so the matcher answers it the same way it would a
// typed question.
import { useTranslation } from 'react-i18next'
import { faq, faqQuestionKey } from '../data/faq'

function FaqPanel ({ onAsk, isSending = false }) {
  const { t } = useTranslation()

  return (
    <div className='chat-faq'>
      <p className='chat-faq__intro'>{t('chatbot.faqIntro')}</p>
      <ul className='chat-faq__list'>
        {faq.map((entry) => {
          const question = t(faqQuestionKey(entry.id))
          return (
            <li key={entry.id}>
              <button
                type='button'
                className='chat-faq__item'
                // Pass the entry id so the answer does not depend on the
                // displayed language matching the matcher's keywords.
                onClick={() => onAsk?.(question, entry.id)}
                disabled={isSending}
              >
                {question}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default FaqPanel
