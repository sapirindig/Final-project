import React from 'react';
import './HomePage.css';
import SiteVisits from '../../components/SiteVisits/SiteVisits';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Welcome to the Home Page</h1>
      </header>
      <main className="homepage-main">
        <div className="posts-box">
          <textarea placeholder="What's happening?" />
          <button>Tweet</button>
        </div>
        <SiteVisits />
      </main>
    </div>
  );
};

export default HomePage;