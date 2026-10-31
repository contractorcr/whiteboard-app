import { useEffect, useState } from 'react';
import cx from 'classnames';
import './NewCanvasModal.css';

function ConfirmRenameModal({ canvasName, onClose, onConfirm }) {
    const [name, setName] = useState(canvasName || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape' && !loading) onClose();
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, loading]);

    async function handleConfirm() {
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError('Canvas name cannot be empty.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await onConfirm(trimmedName);
        } catch (err) {
            setError(err.message || 'Could not rename canvas.');
            setLoading(false);
        }
    }

    return (
        <div
            className="modal-backdrop"
            onClick={(e) =>
                e.target === e.currentTarget && !loading && onClose()
            }
        >
            <div className="modal-card">
                <h2>Rename canvas</h2>

                <p className="modal-subtitle">
                    Enter a new name for "{canvasName}".
                </p>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Canvas name"
                    maxLength={100}
                    autoFocus
                    disabled={loading}
                />

                {error && (
                    <p className="modal-error" role="alert">
                        {error}
                    </p>
                )}

                <div className="modal-actions">
                    <button
                        type="button"
                        className="modal-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className={cx('modal-confirm', {
                            'is-loading': loading,
                        })}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmRenameModal;