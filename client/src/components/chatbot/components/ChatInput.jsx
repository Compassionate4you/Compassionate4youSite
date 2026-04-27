// Chat input field + Send button (DT-332 / DT-333).
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './styles/ChatInput.css';

function ChatInput({ onSend, isSending = false }) {
    const { t } = useTranslation();
    const [value, setValue] = useState('');

    const submit = () => {
        const text = value.trim();
        if (!text || isSending) return;
        onSend?.(text);
        setValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    };

    const isEmpty = value.trim() === '';

    return (
        <form
            className="chat-input"
            onSubmit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <input
                type="text"
                className="chat-input__field"
                placeholder={t('chatbot.placeholder')}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                aria-label={t('chatbot.placeholder')}
            />
            <button
                type="submit"
                className="chat-input__send-btn"
                disabled={isEmpty || isSending}
                aria-label={t('chatbot.send')}
                title={t('chatbot.send')}
            >
                <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M22 2 11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                <span className="chat-input__send-label">{t('chatbot.send')}</span>
            </button>
        </form>
    );
}

export default ChatInput;