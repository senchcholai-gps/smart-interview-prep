import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';
import { API_URL } from '../../services/api';
interface LoginFormProps {
    onSuccess: () => void;
    onSignupClick: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSignupClick }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setError('Please fill all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.user) {
                login(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert(`Welcome back, ${data.user.name || data.user.username}!`);
                onSuccess();
            }

        } catch (err: any) {
            let errorMessage = 'Invalid username or password';
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                errorMessage = 'Cannot connect to the server. Please try again later.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resetEmail) {
            setResetError('Please enter your email address');
            return;
        }

        setResetError('');
        setResetMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Password reset request failed');
            }

            setResetMessage('Password reset link has been sent to your email!');
            setResetEmail('');

            setTimeout(() => {
                setShowForgotPassword(false);
                setResetMessage('');
            }, 3000);

        } catch (err: any) {
            let errorMessage = 'Email not found. Please check and try again.';
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                errorMessage = 'Cannot connect to the server. Please try again later.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            setResetError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Login to Your Account</h2>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label>Username or Email *</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username or email"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password *</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <div className="form-group text-right">
                    <button
                        type="button"
                        className="forgot-password-link"
                        onClick={() => setShowForgotPassword(true)}
                    >
                        Forgot Password?
                    </button>
                </div>

                <div className="form-buttons">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </div>

                <div className="signup-link">
                    Don't have an account?{' '}
                    <button type="button" onClick={onSignupClick} className="link-btn">
                        Sign Up
                    </button>
                </div>
            </form>

            {showForgotPassword && (
                <div className="forgot-password-modal-overlay" onClick={() => setShowForgotPassword(false)}>
                    <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Reset Password</h3>
                            <button className="modal-close" onClick={() => setShowForgotPassword(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {resetError && <div className="error-message">{resetError}</div>}
                            {resetMessage && <div className="success-message">{resetMessage}</div>}

                            <div className="form-group">
                                <label>Enter your registered email address</label>
                                <input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                            <p className="info-text">
                                We'll send you a link to reset your password.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="submit-btn"
                                onClick={handleForgotPassword}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setShowForgotPassword(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LoginForm;