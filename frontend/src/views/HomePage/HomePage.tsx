import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import './HomePage.css';
import SiteVisits from '../../components/SiteVisits/SiteVisits';
import axios from 'axios';
import UploadSpinner from "../../components/UploadSpinner/uploadSpinner";

// קומפוננטת Toast להצגת הודעות
const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        color: '#333',
        padding: '16px 24px',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        fontSize: 16,
        maxWidth: 320,
        textAlign: 'center',
        fontWeight: '500',
      }}
    >
      {message}
    </div>
  );
};

const postToInstagram = async (file: File, caption: string, scheduledAt?: string) => {
  const formData = new FormData();
  formData.append('image', file, file.name);
  formData.append('caption', caption);
  if (scheduledAt) formData.append('scheduledAt', scheduledAt);

  try {
    const res = await axios.post('http://localhost:3000/instagram/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

type PopularPost = {
  id: string;
  caption: string;
  media_url: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  engagement: number;
};

// ** שינוי: ממשק AiSuggestion הותאם למודל InstagramContentSuggestionDoc מה-backend **
type AiSuggestion = {
  _id: string; // ID של המונגוז, כפי שמגיע מה-DB
  userId: string;
  content: string;
  imageUrls: string[]; // מערך של סטרינגים, כפי שמגיע מה-DB
  source: string;
  createdAt: string; // יגיע כסטרינג מה-backend
  refreshed: boolean;
  // title?: string; // הוספתי כהערה. אם ה-AI מייצר title, יש להוסיף אותו למודל ב-backend
};

type LastPostAnalytics = { reach: string; likes: number; comments: number };
type WebsiteAnalytics = { visitorsToday: number; bounceRate: string };

const HomePage: React.FC = () => {
  const [popularContent, setPopularContent] = useState<PopularPost[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState<boolean>(false);

  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);

  const fakeLastPostAnalytics: LastPostAnalytics = { reach: "5,430", likes: 630, comments: 52 };
  const fakeWebsiteAnalytics: WebsiteAnalytics = { visitorsToday: 340, bounceRate: "47%" };

  const lastPostAnalytics: LastPostAnalytics = fakeLastPostAnalytics;
  const websiteAnalytics: WebsiteAnalytics = fakeWebsiteAnalytics;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

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
      showToast('Please select an image file first.');
      return;
    }

    if (scheduledAt) {
      showToast("📅 Your post has been scheduled and will be published as requested.");
      try {
        await postToInstagram(selectedFile, caption, scheduledAt);
      } catch (err: any) {
        showToast("Failed to schedule post: " + err.message);
      }
      return;
    }

    setIsUploading(true);
    try {
      await postToInstagram(selectedFile, caption);
      showToast("Posted to Instagram immediately!");
    } catch (err: any) {
      showToast("Failed to post: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchPopular = async () => {
      setIsLoadingPopular(true);
      try {
        const res = await axios.get<{ posts: PopularPost[] }>("http://localhost:3000/instagram/popular");
        setPopularContent(res.data.posts || []);
      } catch (err: any) {
        console.error("Failed to fetch popular posts:", err.response?.data || err.message);
      } finally {
        setIsLoadingPopular(false);
      }
    };

    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const userString = localStorage.getItem("user");
        console.log("[fetchSuggestions] Retrieved user from localStorage:", userString);

        if (!userString) {
          console.warn("[fetchSuggestions] No user data found in localStorage, aborting fetch.");
          setAiSuggestions([]); // ודא שאתה מאפס במקרה כזה
          return;
        }

        const user = JSON.parse(userString);
        const token = user.token;
        const userId = user._id;

        console.log("[fetchSuggestions] Extracted token:", token);
        console.log("[fetchSuggestions] Using userId:", userId);

        if (!token) {
          console.warn("[fetchSuggestions] Token not found inside user data, aborting fetch.");
          setAiSuggestions([]); // ודא שאתה מאפס במקרה כזה
          return;
        }

        const res = await axios.get<AiSuggestion[]>(
          `http://localhost:3000/ai/suggestions/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("[fetchSuggestions] Response data:", res.data);

        // ** שינוי: ודא ש-res.data הוא מערך גם אם ה-API מחזיר אובייקט עם שדה אחר **
        // אם ה-API מחזיר { suggestions: [...] }, תשנה ל-res.data.suggestions
        if (Array.isArray(res.data)) {
          setAiSuggestions(res.data);
          console.log("[fetchSuggestions] setAiSuggestions with data:", res.data);
        } else {
          console.warn("[fetchSuggestions] Response is not an array, setting empty array.");
          setAiSuggestions([]);
        }
      } catch (err: any) {
        console.error("[fetchSuggestions] Failed to fetch AI suggestions:", err.response?.data || err.message);
        setAiSuggestions([]); // להימנע מהשארת סטייט ישן במקרה של כשל
      } finally {
        setIsLoadingSuggestions(false);
      }
    };
    fetchPopular();
    fetchSuggestions();
  }, []);

  return (
    <div className="homepage">
      {isUploading && <UploadSpinner />}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

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
            <div className="preview-container" style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: 10 }}>
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

        {/* מיקום חדש עבור Pre-generated Suggestions */}
        <section className="section-box">
          <h2>Pre-generated Suggestions</h2>
          {isLoadingSuggestions ? (
            <p>Loading AI-based suggestions...</p>
          ) : aiSuggestions.length === 0 ? (
            <p>No suggestions available at this time.</p>
          ) : (
            <div className="content-cards">
              {aiSuggestions.slice(0, 3).map((sugg) => (
                <div key={sugg._id} className="content-card">
                  {sugg.imageUrls && sugg.imageUrls.length > 0 && (
                    <img
                      src={sugg.imageUrls[0]}
                      alt={sugg.content.substring(0, 50)}
                      className="content-image"
                    />
                  )}
                  <strong>
                    {sugg.content.length > 50 ? sugg.content.slice(0, 50) + "…" : sugg.content}
                  </strong>
                  <p>{sugg.content.length > 100 ? sugg.content.slice(0, 100) + "…" : sugg.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* מיקום חדש עבור Site Visits */}
        <section className="section-box site-visits-section">
          <SiteVisits />
        </section>

        <section className="section-box">
          <h2>Most Popular Content</h2>
          {isLoadingPopular ? (
            <p>Loading popular posts…</p>
          ) : popularContent.length === 0 ? (
            <p>No popular posts found in the last 30 days.</p>
          ) : (
            <div className="content-cards">
              {popularContent.slice(0, 2).map((post) => (
                <div key={post.id} className="content-card">
                  <img
                    src={post.media_url}
                    alt={post.caption || "Popular post"}
                    className="content-image"
                  />
                  <strong>
                    {post.caption.length > 50 ? post.caption.slice(0, 50) + "…" : post.caption}
                  </strong>
                  <p>❤️ {post.like_count} &nbsp;&nbsp; 💬 {post.comments_count}</p>
                </div>
              ))}
            </div>
          )}
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
      </main>
    </div>
  );
};

export default HomePage;