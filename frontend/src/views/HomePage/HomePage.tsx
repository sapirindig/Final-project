import React from 'react';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>SocialAI</h1>
      </header>

      <main className="homepage-main">
        <section className="section-box">
          <h2>Most Popular Content</h2>
          <div className="content-cards">
            <div className="content-card">COMING SOON</div>
            <div className="content-card">COMING SOON</div>
            <div className="content-card">COMING SOON</div>
          </div>
        </section>

        <section className="section-box">
          <h2>Last Post Analytics</h2>
          <div className="analytics-bar"></div>
          <div className="analytics-bar"></div>
          <div className="analytics-bar short"></div>
        </section>

        <section className="section-box">
          <h2>Website Analytics</h2>
          <div className="analytics-bar"></div>
          <div className="analytics-bar"></div>
        </section>

        <section className="section-box">
          <h2>Planning</h2>
          <select><option>Example concept</option></select>
          <select><option>Writing style</option></select>
          <select><option>Length</option></select>
        </section>

        <section className="section-box">
          <h2>Pre-generated Suggestions</h2>
          <p>• 5 Tips for a Healthier Lifestyle</p>
          <p>• Exploring the City at Night</p>
          <p>• Secrets to Effective Time Management</p>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
