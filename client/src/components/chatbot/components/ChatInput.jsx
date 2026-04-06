import { useTranslation } from 'react-i18next';
import './styles/ChatInput.css';

function ChatInput() {
    const { t } = useTranslation();

    return (
        <div className="chat-input">
            <input
                type="text"
                placeholder={t('chatbot.placeholder')}
            />
        </div>
    );
}

export default ChatInput;