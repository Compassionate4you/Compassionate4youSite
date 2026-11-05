// Clickable button rendered inside a bot message (DT-335 accessibility
// actions, DT-423 FAQ page links, DT-171 page navigation).
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAccessibilityBridge } from '../hooks/useAccessibilityBridge'

function ActionButton ({ labelKey, label, actionId, to, highlight }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { runAction } = useAccessibilityBridge()

  const text = labelKey ? t(labelKey) : label

  const handleClick = () => {
    if (actionId === 'navigate' && (to || highlight)) {
      // DT-808: the highlight id rides along in the router state and
      // usePageHighlight picks it up on the new page. With no `to`, the
      // button highlights something on the current page (e.g. the footer).
      navigate(to || location.pathname, highlight ? { state: { chatbotHighlight: highlight } } : undefined)
      return
    }
    runAction(actionId)
  }

  return (
    <button
      type='button'
      className='chat-action-btn'
      onClick={handleClick}
    >
      {text}
    </button>
  )
}

export default ActionButton
