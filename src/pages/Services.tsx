import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './pages.css';
import Navbar from '../components/layout/Navbar';
import AuthModal from '../components/auth/AuthModal';
const Services = () => {
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
  };
  return (
    <div className="page-container">
      <Navbar 
        onLoginClick={openLoginModal}
        onSignupClick={openSignupModal}
        onInterviewClick={handleInterviewClick}
      />
      <main className="page-content">
        <div className="page-hero">
          <h1>Our Free Services</h1>
          <p>All our interview preparation tools are completely free. No subscriptions, no hidden fees, no credit card required.</p>
        </div>
        <div className="divider"></div>
        <section className="free-banner">
          <h2>100% <span className="free-text">Free Forever!</span></h2>
          <p>
            We believe interview preparation should be accessible to everyone. 
            That's why all our features are completely free.
          </p>
        </section>
        <div className="divider"></div>
        <section className="services-section">
          <div className="popular-badge">
            <span>MOST POPULAR</span>
          </div>
          <div className="services-grid">
            <div className="service-card featured">
              <div className="service-icon">🤖</div>
              <h3>AI Interview Simulator</h3>
              <p>Practice with our advanced AI that simulates real technical interviews</p>
              <div className="service-meta">
                <span className="meta-item">🤖 AI Powered</span>
                <span className="meta-item">🆓 Free</span>
              </div>
              <button className="service-btn">Try Now</button>
            </div>
            <div className="service-card">
              <div className="service-icon">🧠</div>
              <h3>Question Generator</h3>
              <p>Get personalized questions based on your target company and role</p>
              <div className="service-meta">
                <span className="meta-item">🆓 Free</span>
                <span className="meta-item">1000+ Questions</span>
              </div>
              <button className="service-btn">Generate Questions</button>
            </div>
            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3>Progress Analytics</h3>
              <p>Track your performance and identify areas for improvement</p>
              <div className="service-meta">
                <span className="meta-item">📈 Real-time Stats</span>
                <span className="meta-item">🆓 Free</span>
              </div>
              <button className="service-btn">View Analytics</button>
            </div>
            <div className="service-card">
              <div className="service-icon">📝</div>
              <h3>Resume Review</h3>
              <p>Get AI-powered feedback on your resume</p>
              <div className="service-meta">
                <span className="meta-item">🤖 AI Analysis</span>
                <span className="meta-item">🆓 Free</span>
              </div>
              <button className="service-btn">Upload Resume</button>
            </div>
            <div className="service-card">
              <div className="service-icon">🎯</div>
              <h3>Mock Interviews</h3>
              <p>Practice with curated question sets</p>
              <div className="service-meta">
                <span className="meta-item">⏱️ Timed Practice</span>
                <span className="meta-item">🆓 Free</span>
              </div>
              <button className="service-btn">Start Practice</button>
            </div>
            <div className="service-card">
              <div className="service-icon">💼</div>
              <h3>Career Path</h3>
              <p>Personalized career guidance and roadmap</p>
              <div className="service-meta">
                <span className="meta-item">🛣️ Custom Roadmap</span>
                <span className="meta-item">🆓 Free</span>
              </div>
              <button className="service-btn">Get Started</button>
            </div>
          </div>
        </section>
        <section className="cta-section">
          <h2>Ready to Ace Your Interview?</h2>
          <p>Join thousands of successful candidates who landed their dream jobs</p>
          <button className="cta-btn" onClick={handleInterviewClick}>
            Start Free Today →
          </button>
        </section>
      </main>
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
    </div>
  );
};
export default Services;
