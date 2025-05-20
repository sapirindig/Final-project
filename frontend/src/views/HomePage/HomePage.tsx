import React from 'react';
import './HomePage.css';

const HomePage: React.FC = () => {
  const hasInstagram = false; // בעתיד זה יתעדכן לפי התחברות אמיתית

  // Fake Data לדוגמה
  const fakePopularContent = [
    {
      title: "Building a Balanced Menu",
      likes: 1230,
      comments: 87,
      image: "/1.png",
    },
    {
      title: "Morning Routine Ideas",
      likes: 980,
      comments: 45,
      image: "/2.png",
    },
    {
      title: "The Most Colorful Salad",
      likes: 870,
      comments: 33,
      image: "/3.png",
    },
  ];

  type LastPostAnalytics = {
    reach: string;
    likes: number;
    comments: number;
  };

  type WebsiteAnalytics = {
    visitorsToday: number;
    bounceRate: string;
  };

  const fakeLastPostAnalytics: LastPostAnalytics = {
    reach: "5,430",
    likes: 630,
    comments: 52,
  };

  const fakeWebsiteAnalytics: WebsiteAnalytics = {
    visitorsToday: 340,
    bounceRate: "47%",
  };

  const popularContent = hasInstagram ? [] : fakePopularContent;
  const lastPostAnalytics: LastPostAnalytics = hasInstagram
    ? { reach: "", likes: 0, comments: 0 }
    : fakeLastPostAnalytics;
  const websiteAnalytics: WebsiteAnalytics = hasInstagram
    ? { visitorsToday: 0, bounceRate: "" }
    : fakeWebsiteAnalytics;

  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>SocialAI</h1>
      </header>

      <main className="homepage-main">
        <section className="section-box">
          <h2>Most Popular Content</h2>
          <div className="content-cards">
            {popularContent.map((item, index) => (
              <div key={index} className="content-card">
                <img src={item.image} alt={item.title} className="content-image" />
                <strong>{item.title}</strong><br />
                ❤️ {item.likes} <br />
                💬 {item.comments} 
              </div>
            ))}
          </div>
        </section>

        <section className="section-box">
          <h2>Last Post Analytics</h2>
          <p>Reach: {lastPostAnalytics.reach}</p>
          <p>Likes: {lastPostAnalytics.likes}</p>
          <p>Comments: {lastPostAnalytics.comments}</p>
        </section>

        <section className="section-box">
          <h2>Website Analytics</h2>
          <p>Visitors Today: {websiteAnalytics.visitorsToday}</p>
          <p>Bounce Rate: {websiteAnalytics.bounceRate}</p>
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
