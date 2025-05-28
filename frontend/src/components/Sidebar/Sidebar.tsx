// Sidebar.tsx
import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import homeIcon from "../../Images/home.png";
import profileIcon from "../../Images/user.png";
import supportIcon from "../../Images/support.png";
import logo from "../../Images/Logo.png";
import createContentIcon from "../../Images/create-content.png";
// import instagramIcon from "../../Images/Instagram_icon.png (1).webp"; // אין צורך יותר לייבא אייקון אינסטגרם כאן
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

type SidebarProps = {
    className?: string;
};

const Sidebar = ({ className = "" }: SidebarProps) => {
import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import logo from "../../Images/Logo.png";
import createContentIcon from "../../Images/createContentIcon.png";
import homeIcon from "../../Images/homeIcon.png";
import profileIcon from "../../Images/profileIcon.png";
import supportIcon from "../../Images/supportIcon.png";
import "./Sidebar.css";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsLoggedIn } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className={`sidebar ${className}`}>
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>

      <div className="menu-items">
        <div
          className="menu-item create-content"
          onClick={() => navigate("/createcontent")}
        >
          <img src={createContentIcon} alt="Create Content" />
          <span>Create Content</span>
        </div>

        <div
          className={`menu-item ${
            location.pathname === "/homepage" ? "active" : ""
          }`}
          onClick={() => navigate("/homepage")}
        >
          <img src={homeIcon} alt="Home" />
          <span>Home</span>
        </div>

        <div
          className={`menu-item ${
            location.pathname === "/user" ? "active" : ""
          }`}
          onClick={() => navigate("/user")}
        >
          <img src={profileIcon} alt="Profile" />
          <span>Profile</span>
        </div>

        <div
          className={`menu-item ${
            location.pathname === "/support" ? "active" : ""
          }`}
          onClick={() => navigate("/support")}
        >
          <img src={supportIcon} alt="Support" />
          <span>Support</span>
        </div>
      </div>

      <div className="logout-button" onClick={handleLogout}>
        <span>Logout</span>
      </div>
    </div>
  );
};

export default Sidebar;

