import React, { useRef, useState, ChangeEvent } from 'react';
import './HomePage.css';
import SiteVisits from '../../components/SiteVisits/SiteVisits';
import axios from 'axios';
import UploadSpinner from "../../components/UploadSpinner/uploadSpinner";

const postToInstagram = async (file: File, caption: string, scheduledAt?: string) => {
  const formData = new FormData();
  formData.append('image', file, file.name);
  formData.append('caption', caption);
  if (scheduledAt) formData.append('scheduledAt', scheduledAt);

  try {
    const res = await axios.post('http://localhost:3000/instagram/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('Posted to Instagram! ' + JSON.stringify(res.data));
  } catch (err: any) {
    alert('Failed to post: ' + (err.response?.data?.message || err.message));
  }
};

const HomePage: React.FC = () => {
  const hasInstagram = false; // בעתיד יתעדכן לאחר התחברות אמיתית

  // דמה לנתונים
  const fakePopularContent = [
    { title: "Building a Balanced Menu", likes: 1230, comments: 87, image: "/1.png" },
    { title: "Morning Routine Ideas", likes: 980, comments: 45, image: "/2.png" },
    { title: "The Most Colorful Salad", likes: 870, comments: 33, image: "/3.png" },
  ];

  type LastPostAnalytics = { reach: string; likes: number; comments: number; };
  type WebsiteAnalytics = { visitorsToday: number; bounceRate: string; };

  const fakeLastPostAnalytics: LastPostAnalytics = { reach: "5,430", likes: 630, comments: 52 };
  const fakeWebsiteAnalytics: WebsiteAnalytics = { visitorsToday: 340, bounceRate: "47%" };

  const popularContent = hasInstagram ? [] : fakePopularContent;
  const lastPostAnalytics: LastPostAnalytics = hasInstagram
    ? { reach: "", likes: 0, comments: 0 }
    : fakeLastPostAnalytics;
  const websiteAnalytics: WebsiteAnalytics = hasInstagram
    ? { visitorsToday: 0, bounceRate: "" }
    : fakeWebsiteAnalytics;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [scheduledAt, setScheduledAt] = useState(''); // תאריך ושעה לתיזמון
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCaptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
  };

  const handleScheduledAtChange = (e: ChangeEvent<HTMLInputElement>) => {
    setScheduledAt(e.target.value);
  };

  const handleButtonClick = async () => {
    if (!selectedFile) {
      alert('Please select an image file first.');
      return;
    }

    if (scheduledAt) {
      // אם יש תזמון, מציגים הודעה במקום ספינר
      alert("📅 Your post has been scheduled and will be published as requested.");
      try {
        await postToInstagram(selectedFile, caption, scheduledAt);
      } catch (err) {
        alert("Failed to schedule post.");
      }
      return;
    }

    // אם אין תזמון, תהליך רגיל עם ספינר
    setIsUploading(true);
    try {
      await postToInstagram(selectedFile, caption);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="homepage">
      {/* ספינר בעת העלאה */}
      {isUploading && <UploadSpinner />}

      <header className="homepage-header">
        <h1>SocialAI</h1>
      </header>

      <main className="homepage-main">
        <section className="section-box full-width-section" style={{ marginBottom: 30 }}>
          <h2>Post Image to Instagram</h2>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ marginTop: 10, width: "100%" }}
          />

          {previewUrl && (
            <div
              className="preview-container"
              style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: 10 }}
            >
              <img
                src={previewUrl}
                alt="Selected preview"
                style={{ maxWidth: "100%", borderRadius: 12, maxHeight: 300, objectFit: "cover" }}
              />
              <textarea
                placeholder="Write a caption..."
                value={caption}
                onChange={handleCaptionChange}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid #ccc",
                  padding: 10,
                  fontSize: 14,
                  resize: "vertical",
                  minHeight: 60,
                  fontFamily: "Arial, sans-serif",
                }}
              />
              <label style={{ fontWeight: "bold" }}>
                Schedule Post:
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={handleScheduledAtChange}
                  style={{
                    marginLeft: 10,
                    padding: 6,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 14,
                  }}
                />
              </label>
            </div>
          )}

          <button onClick={handleButtonClick} style={{ marginTop: 15 }}>
            Post Selected Image & Caption to Instagram
          </button>
        </section>

        <section className="section-box site-visits-section">
          <SiteVisits />
        </section>

        <section className="section-box">
          <h2>Most Popular Content</h2>
          <div className="content-cards">
            {popularContent.map((item, index) => (
              <div key={index} className="content-card">
                <img src={item.image} alt={item.title} className="content-image" />
                <strong>{item.title}</strong>
                <br />
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
          <select>
            <option>Example concept</option>
          </select>
          <select>
            <option>Writing style</option>
          </select>
          <select>
            <option>Length</option>
          </select>
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
