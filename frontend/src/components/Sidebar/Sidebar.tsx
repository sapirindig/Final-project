import "./Sidebar.css";
import searchIcon from "../../Images/search.png";
import homeIcon from "../../Images/home.png";
import profileIcon from "../../Images/user.png";
import supportIcon from "../../Images/support.png";
import logo from "../../Images/Logo.png"; 

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>
      <div className="menu-item">
        <img src={searchIcon} alt="Search" />
        <span>Search</span>
      </div>
      <div className="menu-item">
        <img src={homeIcon} alt="Home" />
        <span>Home</span>
      </div>
      <div className="menu-item">
        <img src={profileIcon} alt="Profile" />
        <span>Profile</span>
      </div>
      <div className="menu-item">
        <img src={supportIcon} alt="Support" />
        <span>Support</span>
      </div>
    </div>
  );
};

export default Sidebar;
