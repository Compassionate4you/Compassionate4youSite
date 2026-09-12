// Expanded chat panel (DT-332).
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import FaqPanel from './FaqPanel';
import './styles/ChatWindow.css';

// DT-392: messages/sendMessage come from ChatbotWidget so the conversation
// survives closing and reopening the window.
function ChatWindow({ onClose, messages, isSending, sendMessage }) {
    const { t } = useTranslation();
    const [showFaq, setShowFaq] = useState(false);

    // DT-420: asking from the FAQ list goes through the normal send flow.
    const askFromFaq = (question) => {
        setShowFaq(false);
        sendMessage(question);
    };

    return (
        <div className="chat-window" role="dialog" aria-label={t('chatbot.title')}>
            <div className="chat-header">
                <span>{t('chatbot.title')}</span>
                <button
                    type="button"
                    className="chat-header__close"
                    onClick={onClose}
                    aria-label={t('chatbot.close')}
                    title={t('chatbot.close')}
                >
                    <svg
                        aria-hidden="true"
                        focusable="false"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    >
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="chat-body">
                {messages.length === 0 && !showFaq ? (
                    <p className="chat-empty-state">{t('chatbot.emptyState')}</p>
                ) : (
                    <MessageList messages={messages} />
                )}
                {showFaq && (
                    <FaqPanel onAsk={askFromFaq} isSending={isSending} />
                )}
            </div>
            <button
                type="button"
                className="chat-faq-toggle"
                onClick={() => setShowFaq((v) => !v)}
                aria-expanded={showFaq}
            >
                {t('chatbot.faqButton')}
            </button>
            <ChatInput onSend={sendMessage} isSending={isSending} />
        </div>
    );
}

export default ChatWindow;
