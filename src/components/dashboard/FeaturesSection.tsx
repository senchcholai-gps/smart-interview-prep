import React from 'react';
import { FEATURES } from '../../utils/constants';
import './dashboard.css';
const FeaturesSection: React.FC = () => {
  return (
    <section className="features-section">
      <h2 className="section-title">Why Choose SmartInterviewPrep?</h2>
      <p className="section-subtitle">Everything you need to ace your technical interviews</p>
      <div className="features-grid">
        {FEATURES.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
export default FeaturesSection;
