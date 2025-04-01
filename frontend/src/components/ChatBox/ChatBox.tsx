import React, { useState } from "react";
import axios from "axios";
import sendIcon from "../../Images/white-send.png";
import attachIcon from "../../Images/paperclip-vertical.png";
import "./ChatBox.css";

type ChatMessage = {
  sender: "user" | "ai";
  text?: string;
  imageUrl?: string;
};

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!message.trim() && !imageFile) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: message || (imageFile ? "[תמונה נשלחה]" : undefined),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      let imageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await axios.post("http://localhost:3000/api/chat/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = uploadRes.data.imageUrl;
      }

      const aiRes = await axios.post("http://localhost:3000/api/chat/message", {
        message,
        imageUrl,
      });

      const aiReply: ChatMessage = {
        sender: "ai",
        text: aiRes.data.response || "לא התקבלה תשובה מה-AI",
        imageUrl: aiRes.data.imageUrl || undefined,
      };

      setMessages((prev) => [...prev, aiReply]);

      setMessage("");
      setImageFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleImageClick = (url: string) => {
    setPreviewImage(url);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div className="chat-box">
      <div className="message-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender === "user" ? "outgoing" : "incoming"}`}>
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="uploaded"
                className="chat-image"
                onClick={() => handleImageClick(msg.imageUrl!)}
              />
            )}
            {msg.text && <p>{msg.text}</p>}
          </div>
        ))}
      </div>

      <div className="input-area">
        <label htmlFor="file-upload">
          <img src={attachIcon} alt="Attach File" style={{ cursor: "pointer" }} />
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>
          <img src={sendIcon} alt="Send" />
        </button>
      </div>

      {previewImage && (
        <div className="image-preview" onClick={closePreview}>
          <img src={previewImage} alt="Preview" />
        </div>
      )}
    </div>
  );
};

export default ChatBox;