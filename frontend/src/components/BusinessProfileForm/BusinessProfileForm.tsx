// BusinessProfileForm.tsx
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import instagramIcon from "../../Images/Instagram_icon.png (1).webp";
import Logo from "../../Images/Logo.png";
import "./BusinessProfileForm.css";
import { AuthContext } from "../../contexts/AuthContext";

const tones = [/* ... */];
const platforms = [/* ... */];
const contentTypes = [/* ... */];
const marketingGoals = [/* ... */];
const postLengths = [/* ... */];
const hashtagsStyles = [/* ... */];

type BusinessProfileFormType = { /* ... */ };

const BusinessProfileForm: React.FC = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const storedUser = localStorage.getItem("user");
  const parsed = storedUser ? JSON.parse(storedUser) : null;
  const token = parsed?.token || null;
  const userId = parsed?._id || null;

  const [formData, setFormData] = useState<BusinessProfileFormType>({ /* init */ });
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  // טען פרופיל קיים
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !userId) return;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/business-profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFormData(await res.json());
      }
    };
    fetchProfile();
  }, [token, userId]);

  const handleChange = (e: React.ChangeEvent<any>) => { /* ... */ };
  const handleColorChange = (i: number, v: string) => { /* ... */ };
  const addEmoji = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  const removeEmoji = (emoji: string) => { /* ... */ };

  // שמירה
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !userId) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/business-profile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) throw new Error("Failed to save profile");
      console.log("Saved profile:", await res.json());
      alert("Saved!");
      setHasChanges(false);
      navigate("/home");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile: " + error);
    }
  };

  // חיבור לאינסטגרם
  const connectInstagram = () => {
    const APP_ID = "YOUR_APP_ID_HERE";
    const REDIRECT_URI = "https://your-social-manager.com/auth/instagram/popup-callback";
    const SCOPE = "user_profile,user_media";
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${SCOPE}&response_type=code`;

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      "InstagramAuth",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        console.log("Instagram popup closed");
      }
    }, 500);

    window.addEventListener(
      "message",
      (event) => {
        if (
          event.origin !== "https://your-social-manager.com" &&
          event.origin !== "http://localhost:3000"
        ) {
          return;
        }
        const msg = event.data;
        if (msg.type === "instagram_auth_success" && msg.code) {
          console.log("Auth code:", msg.code);
          alert("Instagram auth successful!");
        }
      },
      { once: true }
    );
  };

  // אם לא מחובר — טען מצב
  if (!isLoggedIn || !token || !userId) {
    return <div>Loading...</div>;
  }

  // הטופס עצמו
  return (
    <form className="profile-form card p-6 shadow-xl rounded-2xl" onSubmit={handleSubmit}>
      {/* לוגו */}
      <div className="logo">
        <img src={Logo} alt="Logo" />
      </div>

      <h2 className="text-2xl font-bold mb-4">Business Profile Settings</h2>

      {/* שדות הטופס (businessName, businessType, וכו') */}
      {/* ... */}

      {/* כפתורים */}
      <div className="form-buttons">
        <button
          type="button"
          className="instagram-connect-button"
          onClick={connectInstagram}
        >
          <img src={instagramIcon} alt="Instagram" /> Connect Instagram
        </button>
        <button type="submit" className="save-button" disabled={!hasChanges}>
          Save Profile
        </button>
      </div>
    </form>
  );
};

export default BusinessProfileForm;
