import { useEffect, useState } from 'react';
import cx from 'classnames';
import './NewCanvasModal.css';

function ConfirmDeleteModal({ canvasName, onClose, onConfirm }) {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    async function handleConfirm() {
        setError('');
        setLoading(true);

        try {
            await onConfirm();
        } catch (err) {
            setError(err.message || 'Could not delete canvas.');
            setLoading(false);
        }
    }

    return (
        <div
            className="modal-backdrop"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-card">
                <h2>Delete canvas?</h2>
                <p className="modal-subtitle">
                    “{canvasName}” will be permanently deleted. This can’t be undone.
                </p>

                {error && <p className="modal-error" role="alert">{error}</p>}

                <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={cx('modal-delete', { 'is-loading': loading })}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;