// DT-420: "Common questions" list. Clicking a question sends it through the
// normal message flow, so the matcher answers it the same way it would a
// typed question.
import { useTranslation } from 'react-i18next';
import { faq } from '../data/faq';

function FaqPanel({ onAsk, isSending = false }) {
    const { t } = useTranslation();

    return (
        <div className="chat-faq">
            <p className="chat-faq__intro">{t('chatbot.faqIntro')}</p>
            <ul className="chat-faq__list">
                {faq.map((entry) => (
                    <li key={entry.id}>
                        <button
                            type="button"
                            className="chat-faq__item"
                            onClick={() => onAsk?.(entry.question)}
                            disabled={isSending}
                        >
                            {entry.question}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FaqPanel;
