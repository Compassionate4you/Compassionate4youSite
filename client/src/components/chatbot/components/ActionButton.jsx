// Clickable button rendered inside a bot message (DT-335 accessibility actions).
import { useTranslation } from 'react-i18next';
import { useAccessibilityBridge } from '../hooks/useAccessibilityBridge';

function ActionButton({ labelKey, label, actionId }) {
    const { t } = useTranslation();
    const { runAction } = useAccessibilityBridge();

    const text = labelKey ? t(labelKey) : label;

    return (
        <button
            type="button"
            className="chat-action-btn"
            onClick={() => runAction(actionId)}
        >
            {text}
        </button>
    );
}

export default ActionButton;
