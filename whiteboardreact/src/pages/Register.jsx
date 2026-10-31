
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';
import { API_URL } from '../config';
function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleRegister(e) {
        e.preventDefault();

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/users/register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                // express-validator returns errors as an array.
                if (Array.isArray(data.errors)) {
                    throw new Error(
                        data.errors.map((err) => err.msg).join(' ')
                    );
                }

             throw new Error(
    data.message || data.error || 'Registration failed.'
);
            }

            setSuccess(data.message || 'Account created successfully!');

            setName('');
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(
                err.message || 'Something went wrong. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-brand">
                    <div className="register-logo">W</div>
                    <span>Whiteboard</span>
                </div>

                <h1>Create your account</h1>
                <p className="register-subtitle">
                    Start creating and sharing your ideas.
                </p>

                <form onSubmit={handleRegister}>
                    <label htmlFor="name">Full name</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="register-error" role="alert">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="register-success" role="status">
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="register-footer">
                    Already have an account?{' '}
                    <Link to="/">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
