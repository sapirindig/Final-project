import React, { useState } from "react";
import "./ChatBox.css";
import sendIcon from "../../Images/white-send.png"; // אייקון שליחה
import attachIcon from "../../Images/paperclip-vertical.png"; // אייקון לצירוף קבצים

const ChatBox = () => {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message) {
      console.log("Message Sent: ", message);
      setMessage(""); // ננקה את שדה הטקסט אחרי שליחה
    }
  };

  return (
    <div className="chat-box">
      <div className="message-container">
        <div className="message outgoing">
          <p>Hello, how can I help you?</p>
        </div>
        <div className="message incoming">
          <p>Hi, I have a question about your services.</p>
        </div>
      </div>
      <div className="input-area">
        <div className="attachment">
          <img src={attachIcon} alt="Attach File" />
        </div>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>
          <img src={sendIcon} alt="Send" />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
