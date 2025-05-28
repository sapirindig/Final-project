// BusinessProfileForm.tsx
import React, { useState } from "react";
import instagramIcon from "../../Images/Instagram_icon.png (1).webp"; // your Instagram icon
import './BusinessProfileForm.css';
import Logo from "../../Images/Logo.png"; // your app logo
import { useNavigate } from "react-router-dom";

const tones = ["Friendly", "Professional", "Funny", "Luxury", "Inspirational", "Bold", "Minimalistic", "Emotional"];
const platforms = ["Instagram", "Website"];
const contentTypes = ["Posts", "Stories", "Reels", "Newsletter"];
const marketingGoals = ["Build brand awareness", "Generate engagement", "Define number of leads", "Drive sales"];
const postLengths = ["short", "medium", "long"];
const hashtagsStyles = ["none", "fewRelevant", "manyForReach"];

type BusinessProfileFormType = {
  businessName: string;
  businessType: string;
  platforms: string[];
  contentTypes: string[];
  marketingGoals: string[];
  audienceType: string;
  toneOfVoice: string;
  postLength: "short" | "medium" | "long";
  mainColors: string[];
  emojisAllowed: boolean;
  favoriteEmojis: string[];
  hashtagsStyle: "none" | "fewRelevant" | "manyForReach";
  keywords: string;
  customHashtags: string;
};

const BusinessProfileForm: React.FC = () => {
  const [formData, setFormData] = useState<BusinessProfileFormType>({
    businessName: "",
    businessType: "",
    platforms: [],
    contentTypes: [],
    marketingGoals: [],
    audienceType: "",
    toneOfVoice: "Friendly",
    postLength: "medium",
    mainColors: [""],
    emojisAllowed: true,
    favoriteEmojis: [],
    hashtagsStyle: "fewRelevant",
    keywords: "",
    customHashtags: ""
  });
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  const markChanged = () => setHasChanges(true);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    markChanged();
    if (type === "checkbox") {
      if (Array.isArray(formData[name as keyof BusinessProfileFormType])) {
        const arr = formData[name as keyof BusinessProfileFormType] as string[];
        setFormData({
          ...formData,
          [name]: checked
            ? [...arr, value]
            : arr.filter(v => v !== value),
        });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleColorChange = (i: number, v: string) => {
    markChanged();
    const updated = [...formData.mainColors];
    updated[i] = v;
    setFormData({ ...formData, mainColors: updated });
  };

  const addEmoji = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    if (v && formData.favoriteEmojis.length < 7) {
      markChanged();
      setFormData({ ...formData, favoriteEmojis: [...formData.favoriteEmojis, v] });
    }
    e.target.value = "";
  };

  const removeEmoji = (emoji: string) => {
    markChanged();
    setFormData({
      ...formData,
      favoriteEmojis: formData.favoriteEmojis.filter(e => e !== emoji),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("token"); // או מאיפה שאת שומרת את ה-JWT שלך
  
      const response = await fetch("http://localhost:3000/business-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save profile");
      }
  
      const data = await response.json();
      console.log("Saved profile:", data);
      alert("Saved!");
      setHasChanges(false);
      navigate("/home");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile: " + error);
    }
  };
  

  // הלוגיקה של חיבור לאינסטגרם הועברה לכאן:
  const connectInstagram = () => {
    // חשוב: החליפו ב-App ID וב-Redirect URI האמיתיים שלכם מ-Meta for Developers
    const APP_ID = 'YOUR_APP_ID_HERE'; // החליפו ב-App ID שלכם
    const REDIRECT_URI = 'https://your-social-manager.com/auth/instagram/popup-callback'; // החליפו ב-URI ההפניה האמיתי שלכם
    // נתנוך דוגמה, אם אתם עובדים לוקאלית: 'http://localhost:3000/auth/instagram/popup-callback'

    // Scope מציין את ההרשאות שאתם מבקשים מהמשתמש
    const SCOPE = 'user_profile,user_media'; // These are the basic scopes for Instagram Basic Display API
    // For Instagram Graph API, you might also need: instagram_graph_user_profile, instagram_graph_user_media
    // Based on your previous code, you might need more: 'instagram_graph_user_profile,instagram_graph_user_media';

    const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=code`;

    // הגדרת מימדי חלון הקופץ ומיקומו
    const popupWidth = 600;
    const popupHeight = 700;
    const left = (window.screen.width / 2) - (popupWidth / 2);
    const top = (window.screen.height / 2) - (popupHeight / 2);

    // פתיחת חלון קופץ
    const authWindow = window.open(
      instagramAuthUrl,
      'InstagramAuth', // שם החלון (יכול להיות קבוע)
      `width=${popupWidth},height=${popupHeight},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

    // אופציונלי: האזנה לסגירת חלון הקופץ
    const checkPopup = setInterval(() => {
      if (!authWindow || authWindow.closed) {
        clearInterval(checkPopup);
        console.log('Instagram authentication window closed.');
        // כאן, אולי תרצו להפעיל בדיקה ב-backend שלכם
        // כדי לראות אם המשתמש חיבר בהצלחה את חשבון האינסטגרם שלו
        // לדוגמה: checkInstagramLoginStatus();
      }
    }, 1000); // בדיקה כל שנייה

    // חשוב: האזנה להודעות מחלון הקופץ
    // כך חלון הקופץ ישלח את קוד האימות בחזרה לחלון האב
    window.addEventListener('message', (event) => {
      // ודאו שההודעה מגיעה מהמקור הצפוי שלכם לאבטחה
      if (event.origin !== 'https://your-social-manager.com' && event.origin !== 'http://localhost:3000') { // החליפו במקור של האתר שלכם
        return;
      }

      const message = event.data;

      if (message.type === 'instagram_auth_success' && message.code) {
        console.log('Received auth code from popup:', message.code);
        // כעת, שלחו את הקוד הזה ל-backend שלכם כדי להחליף אותו ב-access token
        // פונקציה זו צריכה להיות מיושמת ותבצע קריאת API לשרת שלכם
        // לדוגמה: sendCodeToBackend(message.code);
        alert('אימות אינסטגרם מוצלח! בעיבוד...');
        // אתם תצטרכו ליישם את 'sendCodeToBackend' ברכיב זה או בשירות קשור
        // ולאחר מכן לרענן את ה-UI/סטטוס המשתמש.
      } else if (message.type === 'instagram_auth_error') {
        console.error('Instagram authentication failed:', message.error, message.reason, message.description);
        alert('התחברות לאינסטגרם נכשלה: ' + (message.description || 'אנא נסה שוב.'));
      } else if (message.type === 'instagram_auth_no_code') {
        console.warn('אימות אינסטגרם הסתיים ללא קוד או שגיאה.');
      }
    }, { once: true }); // השתמשו ב-{ once: true } כדי להסיר את ה-listener לאחר שהוא מופעל פעם אחת עבור התחברות מוצלחת
  };

  return (
    <form className="profile-form card p-6 shadow-xl rounded-2xl" onSubmit={handleSubmit}>
      {/* App Logo */}
      <div className="logo">
        <img src={Logo} alt="Logo" />
      </div>

      <h2 className="text-2xl font-bold mb-4">Business Profile Settings</h2>

      <label>Business Name</label>
      <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} />

      <label>Business Type</label>
      <input type="text" name="businessType" value={formData.businessType} onChange={handleChange} />

      <label>Platforms</label>
      <div className="checkbox-group">
        {platforms.map(p => (
          <label key={p}>
            <input type="checkbox" name="platforms" value={p} checked={formData.platforms.includes(p)} onChange={handleChange} /> {p}
          </label>
        ))}
      </div>

      <label>Content Types</label>
      <div className="checkbox-group">
        {contentTypes.map(t => (
          <label key={t}>
            <input type="checkbox" name="contentTypes" value={t} checked={formData.contentTypes.includes(t)} onChange={handleChange} /> {t}
          </label>
        ))}
      </div>

      <label>Marketing Goals</label>
      <div className="checkbox-group">
        {marketingGoals.map(g => (
          <label key={g}>
            <input type="checkbox" name="marketingGoals" value={g} checked={formData.marketingGoals.includes(g)} onChange={handleChange} /> {g}
          </label>
        ))}
      </div>

      <label>Audience Type</label>
      <input type="text" name="audienceType" value={formData.audienceType} onChange={handleChange} />

      <label>Tone of Voice</label>
      <select name="toneOfVoice" value={formData.toneOfVoice} onChange={handleChange}>
        {tones.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <label>Post Length</label>
      <select name="postLength" value={formData.postLength} onChange={handleChange}>
        {postLengths.map(pl => <option key={pl} value={pl}>{pl}</option>)}
      </select>

      <label>Main Colors (up to 5)</label>
      <div className="color-group">
        {[...Array(5)].map((_, i) => (
          <input key={i} type="color" value={formData.mainColors[i] || "#ffffff"} onChange={e => handleColorChange(i, e.target.value)} />
        ))}
      </div>

      <label>Allow Emojis</label>
      <input type="checkbox" name="emojisAllowed" checked={formData.emojisAllowed} onChange={handleChange} />

      <label>Favorite Emojis (up to 7)</label>
      <input type="text" onBlur={addEmoji} placeholder="Type emoji and leave field" />
      <div className="emoji-preview">
        {formData.favoriteEmojis.map(e => (
          <span key={e} onClick={() => removeEmoji(e)}>{e}</span>
        ))}
      </div>

      <label>Hashtag Style</label>
      <select name="hashtagsStyle" value={formData.hashtagsStyle} onChange={handleChange}>
        {hashtagsStyles.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <label>Keywords</label>
      <textarea name="keywords" value={formData.keywords} onChange={handleChange}></textarea>

      <label>Custom Hashtags</label>
      <textarea name="customHashtags" value={formData.customHashtags} onChange={handleChange}></textarea>

      {/* Buttons at bottom styled like Sidebar */}
      <div className="form-buttons">
        {/* כפתור ה-Connect Instagram נמצא כעת כאן */}
        <button type="button" className="instagram-connect-button" onClick={connectInstagram}>
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