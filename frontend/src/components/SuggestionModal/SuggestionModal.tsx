import React, { useState } from "react";
import axios from "axios";
import "./SuggestionModal.css";
import UploadSpinner from "../UploadSpinner/uploadSpinner";

interface AiSuggestion {
  _id: string;
  userId: string;
  content: string;
  imageUrls: string[];
  source: string;
  createdAt: string;
  refrEShed: boolean;
}

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: AiSuggestion | null;
  onPostNow: (suggestion: AiSuggestion) => void;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({
  isOpen,
  onClose,
  suggestion,
  onPostNow,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !suggestion) {
    return null;
  }

  const handlePostNowToInstagram = async () => {
    const caption = suggestion.content;
    const imageUrl = suggestion.imageUrls?.[0];

    if (!imageUrl) {
      console.error("No image URL found.");
      return;
    }

    try {
      setIsLoading(true);

      // הורדת התמונה מה-URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to fetch image");
      }
      const imageBlob = await imageResponse.blob();

      // יצירת File מתוך ה-Blob
      const file = new File([imageBlob], "image.jpg", { type: imageBlob.type });

      // יצירת FormData עם הקובץ והכיתוב
      const formData = new FormData();
      formData.append("image", file);
      formData.append("caption", caption);

      // כאן צריך לשים את הטוקן אם יש לך - לדוגמה:
      const token = "YOUR_AUTH_TOKEN_HERE";

      // שליחת הבקשה עם axios
      const response = await axios.post(
        "https://aisocial.dev/api/api/instagram/post",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // אין להוסיף Content-Type כי axios מטפל בזה אוטומטית עם FormData
          },
        }
      );

      if (response.status === 200) {
        alert("Post successfully uploaded to Instagram!");
        onClose(); // סגירת המודל לאחר הצלחה
      } else {
        alert("Failed to post to Instagram.");
      }
    } catch (error) {
      console.error("Error posting to Instagram:", error);
      alert("An error occurred while posting.");
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
        <button className="modal-close-button" onClick={onClose} disabled={isLoading}>
          &times;
        </button>

        <h2>AI Post Suggestion</h2>

        {suggestion.imageUrls && suggestion.imageUrls.length > 0 && (
          <img
            src={suggestion.imageUrls[0]}
            alt="Suggested Post"
            className="modal-image"
          />
        )}

        <p className="modal-caption">{suggestion.content}</p>

        <div className="modal-actions">
          <button className="post-now-button" onClick={handlePostNowToInstagram} disabled={isLoading}>
            Post Now
          </button>
          <button className="cancel-button" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
        </div>

        {isLoading && (
          <div className="modal-spinner-overlay">
            <UploadSpinner />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionModal;