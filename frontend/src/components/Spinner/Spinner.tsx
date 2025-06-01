// src/components/Spinner/Spinner.tsx
import React from "react";
import { AiOutlineLoading } from "react-icons/ai";
import "./Spinner.css";

const Spinner: React.FC = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <AiOutlineLoading className="spinner-icon" />
        <p className="spinner-text">AI is cooking... 🧠🔥</p>
      </div>
    </div>
  );
};

export default Spinner;
