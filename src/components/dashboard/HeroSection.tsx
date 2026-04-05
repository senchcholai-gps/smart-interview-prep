import React from 'react';
import './dashboard.css';
import DashboardCard from '../DashboardCard';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>
      <div className="hero-content" style={{ flex: '1 1 400px' }}>
        <h2 className="hero-title">🔍 Smart Interview Preparation System</h2>
        <p className="hero-subtitle">
          Free AI-powered platform to help you ace technical interviews using React, TypeScript, and Gemini AI
        </p>
        <div className="hero-features">
          <div className="feature-item">
            <span className="feature-icon">🧠</span>
            <span className="feature-text">Generate Free Questions</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Try Interview Simulator</span>
          </div>
        </div>
        <div className="hero-quote">
          <p className="quote-text">
            "componentDidMount for API calls, componentDidUpdate for prop changes, and componentWillUnmount for cleanup"
          </p>
          <p className="quote-label">Human-AI Interaction</p>
        </div>
      </div>
      
      {/* Dashboard Card placed here */}
      <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
        <DashboardCard />
      </div>
    </section>
  );
};
export default HeroSection;
