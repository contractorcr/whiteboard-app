import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewCanvasModal from '../components/NewCanvasModal';
import './Dashboard.css';
import { FiMoreVertical, FiTrash2, FiEdit2 } from 'react-icons/fi';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ConfirmRenameModal from '../components/ConfirmRenameModal';
import {   FiShare2 } from 'react-icons/fi';
import ShareModal from '../components/ShareModal';
import { API_URL } from '../config';
function Dashboard() {
    const [canvases, setCanvases] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [canvasToDelete, setCanvasToDelete] = useState(null);
    const [canvasToRename, setCanvasToRename] = useState(null);
    const [canvasToShare, setCanvasToShare] = useState(null);

    const [renameName, setRenameName] = useState('');
    const [renameError, setRenameError] = useState('');
    const [renaming, setRenaming] = useState(false);
    const navigate = useNavigate();
 
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        async function loadCanvases() {
            try {
                const response = await fetch(`${API_URL}/canvas`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/');
                    return;
                }
                if (!response.ok) {
                    throw new Error(data.message || data.error || 'Could not load canvases.');
                }

                setCanvases(data.canvases);
            } catch (err) {
                setError(err.message || 'Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        loadCanvases();
    }, [navigate]);
    useEffect(() => {
        if (!openMenuId) return;

        const close = () => setOpenMenuId(null);
        const handleKey = (e) => e.key === 'Escape' && close();

        document.addEventListener('click', close);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('click', close);
            document.removeEventListener('keydown', handleKey);
        };
    }, [openMenuId]);
    function handleLogout() {
        localStorage.removeItem('token');
        navigate('/');
    }

    function handleNewCanvas() {
        setShowModal(true);
    }
    async function handleCreateCanvas(name) {
        const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/canvas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        });
        const data = await response.json();

        if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
            return;
        }
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Could not create canvas.');
        }

        setCanvases((prev) => [{ ...data.canvas, isOwner: true }, ...prev]);
        setShowModal(false);
    }
    async function handleDeleteCanvas(id) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/canvas/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
            return;
        }
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Could not delete canvas.');
        }

        setCanvases((prev) => prev.filter((c) => c._id !== id));
        setCanvasToDelete(null);
    }
    async function handleRenameCanvas(id, name) {
        const token = localStorage.getItem('token');

        const response = await fetch(
            `${API_URL}/canvas/${id}/rename`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name }),
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Could not rename canvas.');
        }

        setCanvases((prev) =>
            prev.map((canvas) =>
                canvas._id === id ? { ...canvas, ...data.canvas } : canvas
            )
        );
    }
    function openCanvas(id) {
        navigate(`/canvas/${id}`);
    }
    async function handleShareCanvas(id, email) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/canvas/${id}/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();

        if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
            throw new Error('Session expired. Please log in again.');
        }
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Could not share canvas.');
        }

        return data.user;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="dashboard-brand">
                        <div className="dashboard-logo">W</div>
                        <span>Whiteboard</span>
                    </div>
                    <button className="dashboard-logout" onClick={handleLogout}>
                        Log out
                    </button>
                </header>

                <div className="dashboard-title-row">
                    <div>
                        <h1>My canvases</h1>
                        <p className="dashboard-subtitle">
                            Open a canvas or start a new one.
                        </p>
                    </div>
                    <button className="dashboard-new" onClick={handleNewCanvas}>
                        + New canvas
                    </button>
                </div>

                {error && (
                    <p className="dashboard-error" role="alert">{error}</p>
                )}

                {loading ? (
                    <p className="dashboard-empty">Loading...</p>
                ) : canvases.length === 0 ? (
                    <p className="dashboard-empty">
                        No canvases yet. Create your first one to get started.
                    </p>
                ) : (
                    <div className="dashboard-grid">
                        {canvases.map((canvas) => (
                            <div className="canvas-card" key={canvas._id}>
                                <div className="canvas-card-top">
                                    <h3>{canvas.name || 'Untitled canvas'}</h3>

                                    {canvas.isOwner ? (
                                        <div className="canvas-menu">
                                            <button
                                                className="canvas-menu-button"
                                                aria-label="Canvas options"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === canvas._id ? null : canvas._id);
                                                }}
                                            >
                                                <FiMoreVertical />
                                            </button>

                                            {openMenuId === canvas._id && (
                                                <div className="canvas-menu-list">
                                                    <button
                                                        className="canvas-menu-item"
                                                        onClick={() => {
                                                            setCanvasToRename(canvas);
                                                            setRenameName(canvas.name || '');
                                                            setRenameError('');
                                                            setOpenMenuId(null);
                                                        }}
                                                    >
                                                        <FiEdit2 /> Rename
                                                    </button>
                                                    <button
                                                        className="canvas-menu-item"
                                                        onClick={() => {
                                                            setCanvasToShare(canvas);
                                                            setOpenMenuId(null);
                                                        }}
                                                    >
                                                        <FiShare2 /> Share
                                                    </button>
                                                    <button
                                                        className="canvas-menu-item canvas-menu-danger"
                                                        onClick={() => {
                                                            setCanvasToDelete(canvas);
                                                            setOpenMenuId(null);
                                                        }}
                                                    >
                                                        <FiTrash2 /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="canvas-badge">Shared</span>
                                    )}
                                </div>
                                <p className="canvas-date">
                                    Updated {new Date(canvas.updatedAt).toLocaleDateString()}
                                </p>
                                <button
                                    className="canvas-open"
                                    onClick={() => openCanvas(canvas._id)}
                                >
                                    Open canvas
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {showModal && (
                <NewCanvasModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreateCanvas}
                />
            )}
            {canvasToRename && (
                <ConfirmRenameModal
                    canvasName={canvasToRename.name || ''}
                    onClose={() => setCanvasToRename(null)}
                    onConfirm={async (name) => {
                        await handleRenameCanvas(canvasToRename._id, name);
                        setCanvasToRename(null);
                    }}
                />
            )}
            {canvasToShare && (
                <ShareModal
                    canvasName={canvasToShare.name || 'Untitled canvas'}
                    onClose={() => setCanvasToShare(null)}
                    onShare={(email) => handleShareCanvas(canvasToShare._id, email)}
                />
            )}
            {canvasToDelete && (
                <ConfirmDeleteModal
                    canvasName={canvasToDelete.name || 'Untitled canvas'}
                    onClose={() => setCanvasToDelete(null)}
                    onConfirm={() => handleDeleteCanvas(canvasToDelete._id)}
                />
            )}

        </div>
    );
}

export default Dashboard;