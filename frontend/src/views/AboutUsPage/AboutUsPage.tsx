import React from 'react';
import './AboutUsPage.css';

const AboutUsPage: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Us</h1>
      </div>
      <div className="about-content">
        <div className="about-image">
          <img src="/picture-AboutUs.png" alt="Our Team" />
        </div>
        <div className="about-text">
          <h2>Who We Are</h2>
          <p>
            We’re SOCIAL.AI — a team of four creative individuals, united by innovation, curiosity, and a passion for helping others grow. With diverse backgrounds in tech, design, AI, and strategy, we’ve combined our strengths to build something both powerful and deeply personal.
          </p>

          <h2>Why We Built SOCIAL.AI</h2>
          <p>
            Content creation can be overwhelming — especially for small business owners, freelancers, and entrepreneurs who have brilliant ideas but limited time or resources. That’s why we created SOCIAL.AI: to generate AI-powered marketing content that feels authentic, aligned with your voice, and ready to use.
          </p>

          <h2>How We Work</h2>
          <p>
            We work across disciplines — blending development, design, AI prompting, and business insight — to create tools that are intuitive, efficient, and inspiring to use. We constantly ask ourselves: Would we enjoy using this? Does it make life easier? Does it spark creativity?
          </p>

          <h2>What We Believe</h2>
          <ul>
            <li>Personal, not generic</li>
            <li>Empowering, not overwhelming</li>
            <li>Fast, but never careless</li>
            <li>Made <strong>with</strong> you — not just <strong>for</strong> you</li>
          </ul>

          <h2>Our Mission</h2>
          <p>
            To help every business tell its story in a way that feels authentic, effortless, and truly their own.
          </p>

          <blockquote>
            “We believe in content that connects — not just converts.”
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;