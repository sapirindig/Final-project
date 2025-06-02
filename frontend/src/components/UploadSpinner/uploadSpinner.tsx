import React from "react";
import { AiOutlineLoading } from "react-icons/ai";
import "./UploadSpinner.css";

const UploadSpinner: React.FC = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <AiOutlineLoading className="spinner-icon" />
        <p className="spinner-text">Uploading your post... 📸✨</p>
      </div>
    </div>
  );
};

export default UploadSpinner;
