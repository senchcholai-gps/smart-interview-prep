import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './auth.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(defaultMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  const switchToLogin = () => {
    setCurrentMode('login');
  };

  const switchToSignup = () => {
    setCurrentMode('signup');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-header">
          <h2>{currentMode === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
          <p>{currentMode === 'login' ? 'Login to continue your interview practice' : 'Start your interview journey with us'}</p>
        </div>

        {/* Mode Tabs */}
        <div className="mode-tabs">
          <button
            className={`tab-btn ${currentMode === 'login' ? 'active' : ''}`}
            onClick={switchToLogin}
          >
            Login
          </button>
          <button
            className={`tab-btn ${currentMode === 'signup' ? 'active' : ''}`}
            onClick={switchToSignup}
          >
            Sign Up
          </button>
        </div>

        <div className="modal-body">
          {currentMode === 'login' ? (
            <LoginForm 
              onSuccess={handleSuccess} 
              onSignupClick={switchToSignup}
            />
          ) : (
            <SignupForm onSuccess={handleSuccess} />
          )}
        </div>

        <div className="modal-footer">
          {currentMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button className="switch-mode-btn" onClick={switchToSignup}>
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button className="switch-mode-btn" onClick={switchToLogin}>
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;