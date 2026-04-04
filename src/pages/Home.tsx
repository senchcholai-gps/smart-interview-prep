import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/dashboard/HeroSection';
import AuthModal from '../components/auth/AuthModal';
const Home = () => {
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const openLoginModal = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };
  const openSignupModal = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };
  const handleInterviewClick = () => {
    if (!isAuthenticated) {
      alert('Please login or sign up to start an interview!');
      openLoginModal();
      return;
    }
    setIsInterviewModalOpen(true);
  };
  const startInterview = (type: string) => {
    alert(`Starting ${type} interview!`);
    setIsInterviewModalOpen(false);
    // In real app, navigate to interview page or open interview component
  };
  return (
    <div className="app">
      <Navbar 
        onLoginClick={openLoginModal}
        onSignupClick={openSignupModal}
        onInterviewClick={handleInterviewClick}
      />
      <main className="main-container">
        <HeroSection />
        <div className="features-section">
          <div className="feature">
            <h3>🧠 Generate Free Questions</h3>
            <p>AI-powered question generation for technical interviews</p>
            <button className="feature-btn" onClick={openSignupModal}>
              Get Started
            </button>
          </div>
          <div className="feature">
            <h3>🎯 Try Interview Simulator</h3>
            <p>Practice with realistic interview scenarios</p>
            <button className="feature-btn" onClick={openSignupModal}>
              Start Practice
            </button>
          </div>
        </div>
        <div className="human-ai-section">
          <h2>Human-AI Interaction</h2>
          <p>
            Learn about React lifecycle methods: 
            <a href="#">componentDidMount</a> for API calls, 
            <a href="#">componentDidUpdate</a> for prop changes, and 
            <a href="#">componentWillUnmount</a> for cleanup...
          </p>
        </div>
        <div className="services-preview">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Mock Interviews</h3>
              <p>Practice with AI-powered mock interviews</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            <div className="service-card">
              <h3>Resume Review</h3>
              <p>Get your resume reviewed by AI</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            <div className="service-card">
              <h3>Career Guidance</h3>
              <p>Personalized career path suggestions</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
          </div>
        </div>
        <div className="contact-preview">
          <h2>Contact Us</h2>
          <p>Have questions? Reach out to us at support@smartinterviewprep.com</p>
          <Link to="/contact" className="contact-link">Visit Contact Page →</Link>
        </div>
      </main>
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
      {/* Interview Modal */}
      {isInterviewModalOpen && (
        <div className="modal-overlay" onClick={() => setIsInterviewModalOpen(false)}>
          <div className="interview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsInterviewModalOpen(false)}>×</button>
            <h2>🎯 Start Your Interview</h2>
            <p>Select the type of interview you want to practice:</p>
            <div className="interview-options">
              <div className="option-card">
                <h3>Technical Interview</h3>
                <p>Practice coding questions and system design</p>
                <button className="option-btn" onClick={() => startInterview('Technical')}>
                  Start Now
                </button>
              </div>
              <div className="option-card">
                <h3>Behavioral Interview</h3>
                <p>Practice soft skills and situational questions</p>
                <button className="option-btn" onClick={() => startInterview('Behavioral')}>
                  Start Now
                </button>
              </div>
              <div className="option-card">
                <h3>Mixed Interview</h3>
                <p>Combination of technical and behavioral</p>
                <button className="option-btn" onClick={() => startInterview('Mixed')}>
                  Start Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <footer className="footer">
        <p>© 2024 SmartInterviewPrep. Free AI-powered platform to help you ace technical interviews using React, TypeScript, and Gemini AI</p>
        <div className="footer-links">
          <Link to="/">Home</Link> | 
          <Link to="/about">About Us</Link> | 
          <Link to="/services">Services</Link> | 
          <Link to="/contact">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
};
export default Home;
