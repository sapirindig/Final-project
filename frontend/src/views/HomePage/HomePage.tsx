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
        <SiteVisits />
      </main>
    </div>
  );
};

export default HomePage;