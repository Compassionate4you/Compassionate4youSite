//Resuable confirmation modal used accross Admin Dash
function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Yes",
    cancelText = "No",
    onConfirm,
    onCancel,
}) {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="logout-modal-overlay"
            onClick={onCancel}
        >
            <div
                className="logout-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-confirm-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 id="admin-confirm-modal-title">
                    {title}
                </h2>

                <p>{message}</p>

                <div className="logout-modal-actions">
                    <button
                        type="button"
                        className="logout-no-button"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className="logout-yes-button"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;