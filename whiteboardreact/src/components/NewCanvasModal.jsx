import { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import './NewCanvasModal.css';

function NewCanvasModal({ onClose, onCreate }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
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
        setLoading(true);

        try {
            await onCreate(name);
        } catch (err) {
            setError(err.message || 'Could not create canvas.');
            setLoading(false);
        }
    }

    return (
        <div
            className="modal-backdrop"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <form className="modal-card" onSubmit={handleSubmit}>
                <h2>New canvas</h2>
                <p className="modal-subtitle">Give your canvas a name.</p>

                <label htmlFor="canvas-name">Canvas name</label>
                <input
                    id="canvas-name"
                    ref={inputRef}
                    type="text"
                    placeholder="Untitled canvas"
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cx('modal-input', { 'modal-input-error': error })}
                />

                {error && <p className="modal-error" role="alert">{error}</p>}

                <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={cx('modal-create', { 'is-loading': loading })}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NewCanvasModal;