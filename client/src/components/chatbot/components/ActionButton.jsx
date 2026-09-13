// Clickable button rendered inside a bot message (DT-335 accessibility
// actions, DT-423 FAQ page links).
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAccessibilityBridge } from '../hooks/useAccessibilityBridge';

function ActionButton({ labelKey, label, actionId, to }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { runAction } = useAccessibilityBridge();

    const text = labelKey ? t(labelKey) : label;

    const handleClick = () => {
        if (actionId === 'navigate' && to) {
            navigate(to);
            return;
        }
        runAction(actionId);
    };

    return (
        <button
            type="button"
            className="chat-action-btn"
            onClick={handleClick}
        >
            {text}
        </button>
    );
}

export default ActionButton;
