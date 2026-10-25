// DT-625 Sprint 8
// Preston Ball
// Reusable accessible custom dialog modal for save confirmations, unsaved changes, deletions, and alerts

import React, { useEffect } from 'react'
import { AlertCircle, HelpCircle, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react'
import '../../../styles/components/CustomModal.css'

export default function CustomModal ({
  isOpen,
  title,
  message,
  type = 'confirm',
  confirmText = 'Confirm',
  discardText = 'Discard Changes',
  cancelText = 'Cancel',
  isConfirming = false,
  onConfirm,
  onDiscard,
  onCancel
}) {
  // DT-625 Sprint 8 - Preston Ball: Handle Escape key dismissal
  useEffect(() => {
    function handleKeyDown (e) {
      if (e.key === 'Escape' && isOpen && onCancel) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  // DT-625 Sprint 8 - Preston Ball: Select icon by modal type
  const renderIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 size={24} color="#dc2626" />
      case 'save-discard':
      case 'warning':
        return <AlertTriangle size={24} color="#d97706" />
      case 'alert':
      case 'error':
        return <AlertCircle size={24} color="#dc2626" />
      case 'success':
        return <CheckCircle2 size={24} color="#16a34a" />
      case 'confirm':
      default:
        return <HelpCircle size={24} color="#0284c7" />
    }
  }

  return (
    <div className="custom-modal-overlay" onClick={onCancel}>
      {/* DT-625 Sprint 8 - Preston Ball: Accessible modal container */}
      <div
        className="custom-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="custom-modal-header">
          {renderIcon()}
          <h2 id="custom-modal-title" className="custom-modal-title">
            {title}
          </h2>
        </div>

        <div className="custom-modal-body">
          {typeof message === 'string' ? <p style={{ margin: 0 }}>{message}</p> : message}
        </div>

        <div className="custom-modal-actions">
          {type === 'save-discard' && (
            <>
              {/* DT-625 Sprint 8 - Preston Ball: 3-way save, discard, or cancel actions */}
              <button
                type="button"
                className="custom-modal-btn custom-modal-btn--outline-danger"
                onClick={onDiscard}
                disabled={isConfirming}
              >
                {discardText}
              </button>
              <button
                type="button"
                className="custom-modal-btn custom-modal-btn--cancel"
                onClick={onCancel}
                disabled={isConfirming}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className="custom-modal-btn custom-modal-btn--primary"
                onClick={onConfirm}
                disabled={isConfirming}
              >
                {confirmText}
              </button>
            </>
          )}

          {type === 'delete' && (
            <>
              <button
                type="button"
                className="custom-modal-btn custom-modal-btn--cancel"
                onClick={onCancel}
                disabled={isConfirming}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className="custom-modal-btn custom-modal-btn--danger"
                onClick={onConfirm}
                disabled={isConfirming}
              >
                {confirmText}
              </button>
            </>
          )}

          {type === 'confirm' && (
            <>
              <button
                type="button"
                className="custom-modal-btn custom-modal-btn--cancel"
                onClick={onCancel}
                disabled={isConfirming}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className="custom-modal-btn custom-modal-btn--primary"
                onClick={onConfirm}
                disabled={isConfirming}
              >
                {confirmText}
              </button>
            </>
          )}

          {type === 'alert' && (
            <button
              type="button"
              className="custom-modal-btn custom-modal-btn--primary"
              onClick={onConfirm || onCancel}
            >
              {confirmText || 'OK'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
