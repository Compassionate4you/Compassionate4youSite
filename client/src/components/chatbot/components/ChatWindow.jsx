// Expanded chat panel (DT-332).
import { useTranslation } from 'react-i18next';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { useChatbot } from '../hooks/useChatbot';
import './styles/ChatWindow.css';

function ChatWindow({ onClose }) {
    const { t } = useTranslation();
    const { messages, isSending, sendMessage } = useChatbot();

    return (
        <div className="chat-window" role="dialog" aria-label={t('chatbot.title')}>
            <div className="chat-header">
                <span>{t('chatbot.title')}</span>
                <button
                    type="button"
                    className="chat-header__close"
                    onClick={onClose}
                    aria-label={t('chatbot.close')}
                >
                    −
                </button>
            </div>
            <div className="chat-body">
                {messages.length === 0 ? (
                    <p className="chat-empty-state">{t('chatbot.emptyState')}</p>
                ) : (
                    <MessageList messages={messages} />
                )}
            </div>
            <ChatInput onSend={sendMessage} isSending={isSending} />
        </div>
    );
}

export default ChatWindow;