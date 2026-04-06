import { useTranslation } from 'react-i18next';
import ChatInput from './ChatInput';
import './styles/ChatWindow.css';

function ChatWindow({ onClose }) {
    const { t } = useTranslation();

    return (
        <div className="chat-window">
            <div className="chat-header">
                <span>{t('chatbot.title')}</span>
                <button onClick={onClose}>-</button>
            </div>
            <div className="chat-body">
            </div>
            <ChatInput />
        </div>
    );
}

export default ChatWindow;