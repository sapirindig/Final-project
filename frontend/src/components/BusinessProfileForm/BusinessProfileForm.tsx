import { useState, useEffect, useContext } from "react";
import './BusinessProfileForm.css';
import { AuthContext } from "../../contexts/AuthContext";

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

const BusinessProfileForm = () => {
  const { isLoggedIn } = useContext(AuthContext);

  const storedUser = localStorage.getItem("user");
  const parsed = storedUser ? JSON.parse(storedUser) : null;
  const token = parsed?.token || null;
  const userId = parsed?._id || null;

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

  const markChanged = () => setHasChanges(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    markChanged();

    if (type === "checkbox") {
      if (Array.isArray(formData[name as keyof BusinessProfileFormType])) {
        setFormData({
          ...formData,
          [name]: checked
            ? [...(formData[name as keyof BusinessProfileFormType] as string[]), value]
            : (formData[name as keyof BusinessProfileFormType] as string[]).filter((v) => v !== value),
        });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleColorChange = (index: number, value: string) => {
    markChanged();
    const updatedColors = [...formData.mainColors];
    updatedColors[index] = value;
    setFormData({ ...formData, mainColors: updatedColors });
  };

  const addEmoji = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && formData.favoriteEmojis.length < 7) {
      markChanged();
      setFormData({
        ...formData,
        favoriteEmojis: [...formData.favoriteEmojis, value],
      });
    }
    e.target.value = "";
  };

  const removeEmoji = (emoji: string) => {
    markChanged();
    setFormData({
      ...formData,
      favoriteEmojis: formData.favoriteEmojis.filter((e) => e !== emoji),
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !userId) return;

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/business-profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      } else {
        console.log("No profile found or error fetching");
      }
    };

    fetchProfile();
  }, [token, userId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !userId) return;

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/business-profile/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Business profile saved successfully!");
      setHasChanges(false);
    } else {
      console.error(data);
      alert("Failed to save profile.");
    }
  };

  if (!isLoggedIn || !token || !userId) {
    return <div>Loading...</div>;
  }

  return (
    <form className="profile-form card p-6 shadow-xl rounded-2xl" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Business Profile Settings</h2>

      <label>Business Name</label>
      <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} />

      <label>Business Type</label>
      <input type="text" name="businessType" value={formData.businessType} onChange={handleChange} />

      <label>Platforms</label>
      <div className="checkbox-group">
        {platforms.map((p) => (
          <label key={p}><input type="checkbox" name="platforms" value={p} checked={formData.platforms.includes(p)} onChange={handleChange} /> {p}</label>
        ))}
      </div>

      <label>Content Types</label>
      <div className="checkbox-group">
        {contentTypes.map((t) => (
          <label key={t}><input type="checkbox" name="contentTypes" value={t} checked={formData.contentTypes.includes(t)} onChange={handleChange} /> {t}</label>
        ))}
      </div>

      <label>Marketing Goals</label>
      <div className="checkbox-group">
        {marketingGoals.map((g) => (
          <label key={g}><input type="checkbox" name="marketingGoals" value={g} checked={formData.marketingGoals.includes(g)} onChange={handleChange} /> {g}</label>
        ))}
      </div>

      <label>Audience Type</label>
      <input type="text" name="audienceType" value={formData.audienceType} onChange={handleChange} />

      <label>Tone of Voice</label>
      <select name="toneOfVoice" value={formData.toneOfVoice} onChange={handleChange}>
        {tones.map((tone) => (
          <option key={tone} value={tone}>{tone}</option>
        ))}
      </select>

      <label>Post Length</label>
      <select name="postLength" value={formData.postLength} onChange={handleChange}>
        {postLengths.map((length) => (
          <option key={length} value={length}>{length}</option>
        ))}
      </select>

      <label>Main Colors (up to 5)</label>
      {[...Array(5)].map((_, i) => (
        <input key={i} type="color" value={formData.mainColors[i] || "#ffffff"} onChange={(e) => handleColorChange(i, e.target.value)} />
      ))}

      <label>Allow Emojis</label>
      <input type="checkbox" name="emojisAllowed" checked={formData.emojisAllowed} onChange={handleChange} />

      <label>Favorite Emojis (up to 7)</label>
      <input type="text" onBlur={addEmoji} placeholder="Type emoji and leave field" />
      <div className="emoji-preview">
        {formData.favoriteEmojis.map((e) => (
          <span key={e} onClick={() => removeEmoji(e)}>{e}</span>
        ))}
      </div>

      <label>Hashtag Style</label>
      <select name="hashtagsStyle" value={formData.hashtagsStyle} onChange={handleChange}>
        {hashtagsStyles.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <label>Keywords</label>
      <textarea name="keywords" value={formData.keywords} onChange={handleChange}></textarea>

      <label>Custom Hashtags</label>
      <textarea name="customHashtags" value={formData.customHashtags} onChange={handleChange}></textarea>

      {hasChanges && (
        <button type="submit" className="btn btn-primary mt-4">Save Profile</button>
      )}
    </form>
  );
};

export default BusinessProfileForm;
