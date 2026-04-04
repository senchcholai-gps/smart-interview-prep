import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './pages.css';
import Navbar from '../components/layout/Navbar';
import AuthModal from '../components/auth/AuthModal';
const AboutUs = () => {
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
          <h1>About Us</h1>
          <p>Learn about our mission, vision, and values</p>
        </div>
        <section className="content-section">
          <h2>Our Mission</h2>
          <p>
            At SmartInterviewPrep, we believe that everyone deserves the opportunity to showcase 
            their skills and land their dream job. We're on a mission to democratize interview 
            preparation through AI-powered tools that adapt to your unique needs.
          </p>
          <p>
            Founded in 2024, we've helped thousands of candidates prepare for technical interviews 
            at top companies like Google, Microsoft, Amazon, and more.
          </p>
        </section>
        <div className="divider"></div>
        <section className="content-section">
          <h3>Our Vision</h3>
          <p className="vision-text">
            To become the world's most comprehensive interview preparation platform.
          </p>
        </section>
        <div className="divider"></div>
        <section className="content-section">
          <h3>Our Values</h3>
          <ul className="values-list">
            <li>Innovation in education technology</li>
            <li>Accessibility for all learners</li>
            <li>Personalized learning experiences</li>
            <li>Continuous improvement</li>
            <li>Community-driven development</li>
          </ul>
        </section>
        <section className="team-section">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">👨‍💻</div>
              <h4>Alex Johnson</h4>
              <p>Founder & CEO</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">👩‍🔬</div>
              <h4>Sarah Chen</h4>
              <p>AI Research Lead</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">👨‍🏫</div>
              <h4>Michael Park</h4>
              <p>Education Specialist</p>
            </div>
          </div>
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
export default AboutUs;
