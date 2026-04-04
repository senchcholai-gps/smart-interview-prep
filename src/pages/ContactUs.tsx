import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './pages.css';
import Navbar from '../components/layout/Navbar';
import AuthModal from '../components/auth/AuthModal';
const ContactUs = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ fullName: '', email: '', subject: '', message: '' });
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
          <h1>Contact Us</h1>
          <p>Have questions? We're here to help! Reach out to our team for support, partnership inquiries, or feedback.</p>
        </div>
        <div className="divider"></div>
        <div className="contact-container">
          <div className="contact-info">
            <h2>Our Office</h2>
            <div className="address">
              <p><strong>123 Tech Street</strong></p>
              <p>San Francisco, CA 94107</p>
              <p>United States</p>
            </div>
            <div className="contact-details">
              <h3>Get in Touch</h3>
              <p>📧 Email: support@smartinterviewprep.com</p>
              <p>📞 Phone: +1 (555) 123-4567</p>
              <p>🕒 Hours: Monday-Friday, 9AM-6PM PST</p>
            </div>
            <div className="social-links">
              <h3>Follow Us</h3>
              <div className="social-icons">
                <a href="#" className="social-icon">🐦</a>
                <a href="#" className="social-icon">💼</a>
                <a href="#" className="social-icon">📘</a>
                <a href="#" className="social-icon">📷</a>
              </div>
            </div>
          </div>
          <div className="contact-form-container">
            <div className="form-header">
              <h2>Send us a message</h2>
              <p>Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Product Feedback</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="career">Career Opportunities</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  rows={5}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">
                Send Message →
              </button>
            </form>
          </div>
        </div>
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Is SmartInterviewPrep really free?</h3>
              <p>Yes! All our services are completely free forever. We believe in making interview preparation accessible to everyone.</p>
            </div>
            <div className="faq-item">
              <h3>How does the AI Interview Simulator work?</h3>
              <p>Our AI analyzes your responses in real-time and provides personalized feedback to help you improve.</p>
            </div>
            <div className="faq-item">
              <h3>Can I use this on mobile?</h3>
              <p>Yes! Our platform is fully responsive and works on all devices including smartphones and tablets.</p>
            </div>
          </div>
        </section>
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
    </div>
  );
};
export default ContactUs;
