import { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import './NewCanvasModal.css';

function ShareModal({ canvasName, onClose, onShare }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();

        function handleKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const user = await onShare(email.trim());
            setSuccess(`Shared with ${user.email}`);
            setEmail('');
        } catch (err) {
            setError(err.message || 'Could not share canvas.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="modal-backdrop"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <form className="modal-card" onSubmit={handleSubmit}>
                <h2>Share canvas</h2>
                <p className="modal-subtitle">
                    Give someone access to “{canvasName}”.
                </p>

                <label htmlFor="share-email">Email address</label>
                <input
                    id="share-email"
                    ref={inputRef}
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cx('modal-input', { 'modal-input-error': error })}
                    required
                />

                {error && <p className="modal-error" role="alert">{error}</p>}
                {success && <p className="modal-success" role="status">{success}</p>}

                <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={onClose}>
                        Done
                    </button>
                    <button
                        type="submit"
                        className={cx('modal-create', { 'is-loading': loading })}
                        disabled={loading}
                    >
                        {loading ? 'Sharing...' : 'Share'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ShareModal;