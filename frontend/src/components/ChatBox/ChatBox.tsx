import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import sendIcon from "../../Images/white-send.png";
import attachIcon from "../../Images/paperclip-vertical.png";
import "./ChatBox.css";
import Spinner from "../Spinner/Spinner";

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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasUserStartedTyping = useRef(false);
    const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false); 

  const initialMessage: ChatMessage = {
    sender: "ai",
    text: "In this box, guide the AI on the type of post you'd like to create. Ask questions, brainstorm ideas, and request assistance in crafting your content.",
  };

  useEffect(() => {
    if (messages.length === 0 && !hasUserStartedTyping.current) {
      setMessages([initialMessage]);
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() && !imageFile) return;
 setIsSendingMessage(true);
    const userMsg: ChatMessage = {
      sender: "user",
      text: message,
    };
    setMessages((prev) => [...prev, userMsg]);

    setMessage("");
    setImageFile(null);

    try {
      let imageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await axios.post("http://aisocial.dev/api/api/chat/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = uploadRes.data.imageUrl;
      }

      const aiRes = await axios.post("http://aisocial.dev/api/api/chat/message", {
        message,
        imageUrl,
      });

      const aiReply: ChatMessage = {
        sender: "ai",
        text: aiRes.data.response || "No response from AI",
        imageUrl: aiRes.data.imageUrl || undefined,
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
     setIsSendingMessage(false); 
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    hasUserStartedTyping.current = true;
  
    if (inputRef.current) {
      inputRef.current.style.height = "auto"; 
      const newHeight = Math.min(inputRef.current.scrollHeight, 120); 
      inputRef.current.style.height = `${newHeight}px`;
    }
  
    if (
      messages.length === 1 &&
      messages[0].sender === "ai" &&
      e.target.value.trim() !== ""
    ) {
      setMessages([]);
    }
  };
  

  const handleImageClick = (url: string) => {
    setPreviewImage(url);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div className="chat-box-container">
      {isSendingMessage && <Spinner />}
      <div className="message-container" ref={chatContainerRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender === "user" ? "outgoing" : "incoming"}`}>
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt={msg.sender === "user" ? "Your image" : "AI response"}
                className="chat-image"
                onClick={() => handleImageClick(msg.imageUrl!)}
              />
            )}
            {msg.text && <p>{msg.text}</p>}
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <label htmlFor="file-upload" className="attachment">
          <img src={attachIcon} alt="Attach File" />
        </label>
        <textarea
          ref={inputRef}
          placeholder=""
          value={message}
          onChange={handleInputChange}
          className="chat-input"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage} className="send-button">
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
