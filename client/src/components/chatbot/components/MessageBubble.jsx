// Renders a single user or bot message bubble.

import { useTranslation } from 'react-i18next';
import ActionButton from './ActionButton';

function MessageBubble({ message }) {
    const { t } = useTranslation();
    const isUser = message.sender === 'user';

    const text = message.textKey ? t(message.textKey) : message.text || '';
    const actions = Array.isArray(message.actionButtons)
        ? message.actionButtons
        : [];

    return (
        <div className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--bot'}`}>
            <div className="chat-bubble__text">{text}</div>
            {actions.length > 0 && (
                <div className="chat-bubble__actions">
                    {actions.map((action, idx) => (
                        <ActionButton
                            key={`${action.actionId}-${idx}`}
                            labelKey={action.labelKey}
                            label={action.label}
                            actionId={action.actionId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MessageBubble;
