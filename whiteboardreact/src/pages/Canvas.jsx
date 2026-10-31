import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { FiArrowLeft } from 'react-icons/fi';
import Board from '../components/Board';
import Toolbar from '../toolbar/Toolbar';
import Toolbox from '../toolbox/Toolbox';
import Boardcontextprovider from '../store/boardcontextprovider';
import Toolboxcontextprovider from '../store/Toolboxcontextprovder';
import './Canvas.css';
import { API_URL } from '../config';


function Canvas() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [canvas, setCanvas] = useState(null);
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // 1. Load the canvas over REST
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        async function loadCanvas() {
            try {
                const response = await fetch(`${API_URL}/canvas/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/');
                    return;
                }
                if (!response.ok) {
                    throw new Error(data.message || data.error || 'Could not load canvas.');
                }

                setCanvas(data.canvas);
            } catch (err) {
                setError(err.message || 'Something went wrong.');
            } finally {
                setLoading(false);
            }
        }

        loadCanvas();
    }, [id, navigate]);

    // 2. Once loaded, open the socket and join this canvas's room
    useEffect(() => {
        if (!canvas) return;

        const s = io(`${API_URL}`, {
            auth: { token: localStorage.getItem('token') },
        });

        s.on('connect', () => {
            s.emit('join-canvas', id, (res) => {
                if (!res?.ok) console.error('join-canvas failed:', res?.error);
            });
        });

        s.on('connect_error', (err) => console.error('Socket error:', err.message));

        setSocket(s);

        return () => {
            s.disconnect();
            setSocket(null);
        };
    }, [canvas, id]);

    // Early returns come AFTER all hooks
    if (loading) return <p style={{ padding: 24 }}>Loading canvas...</p>;

    if (error) {
        return (
            <div style={{ padding: 24 }}>
                <p>{error}</p>
                <Link to="/dashboard">Back to dashboard</Link>
            </div>
        );
    }

    return (
        <Toolboxcontextprovider>
            <Boardcontextprovider
                initialElements={canvas.elements || []}
                socket={socket}
                canvasId={id}
            >
                <Link to="/dashboard" className="canvas-exit" title="Back to dashboard">
                    <FiArrowLeft className="canvas-exit-icon" />
                    <span className="canvas-exit-name">{canvas.name || 'Untitled canvas'}</span>
                </Link>
                <Board />
                <Toolbar />
                <Toolbox />
            </Boardcontextprovider>
        </Toolboxcontextprovider>
    );
}

export default Canvas;