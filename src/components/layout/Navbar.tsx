import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './layout.css';
interface NavbarProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onInterviewClick?: () => void;
}
const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onSignupClick, onInterviewClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="logo">SmartInterviewPrep</Link>
        </div>
        <div className="nav-center">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/services" className="nav-link">Services</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
          {/* Show "Take an Interview" link when user is logged in */}
          {isAuthenticated && (
            <button 
              className="nav-link interview-nav-btn"
              onClick={onInterviewClick}
            >
              🎯 Take an Interview
            </button>
          )}
        </div>
        <div className="nav-right">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="welcome-text">Hi, {user?.username}</span>
              <button className="nav-btn logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <button className="nav-btn login-btn" onClick={onLoginClick}>
                Login
              </button>
              <button className="nav-btn signup-btn" onClick={onSignupClick}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
