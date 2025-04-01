import "./Sidebar.css";
import { useNavigate } from "react-router-dom";
//import searchIcon from "../../Images/search.png";
import homeIcon from "../../Images/home.png";
import profileIcon from "../../Images/user.png";
import supportIcon from "../../Images/support.png";
import logo from "../../Images/Logo.png";
import createContentIcon from "../../Images/create-content.png";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>
      <div className="menu-items">
        <div className="menu-item create-content" onClick={() => navigate('/createcontent')}>
          <img src={createContentIcon} alt="Create Content" />
          <span>Create Content</span>
        </div>
        <div className="menu-item" onClick={() => navigate('/homepage')}>
          <img src={homeIcon} alt="Home" />
          <span>Home</span>
        </div>
        <div className="menu-item" onClick={() => navigate('/user')}>
          <img src={profileIcon} alt="Profile" />
          <span>Profile</span>
        </div>
        <div className="menu-item">
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
