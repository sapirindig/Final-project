// Sidebar.tsx
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";
import homeIcon from "../../Images/home.png";
import profileIcon from "../../Images/user.png";
import supportIcon from "../../Images/support.png";
import logo from "../../Images/Logo.png";
import createContentIcon from "../../Images/create-content.png";
// import instagramIcon from "../../Images/Instagram_icon.png (1).webp"; // אין צורך יותר לייבא אייקון אינסטגרם כאן
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

// הוספת תמיכה בפרופס
type SidebarProps = {
    className?: string;
};

const Sidebar = ({ className = "" }: SidebarProps) => {
    const navigate = useNavigate();
    const { setIsLoggedIn } = useContext(AuthContext); // עדיין נחוץ ל-handleLogout

    const handleLogout = () => {
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        navigate("/");
    };

    // לוגיקת ה-handleInstagramLogin הוסרה מכאן.

    return (
        <div className={`sidebar ${className}`}>
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <div className="menu-items">
                <div className="menu-item create-content" onClick={() => navigate("/createcontent")}>
                    <img src={createContentIcon} alt="Create Content" />
                    <span>Create Content</span>
                </div>
                <div className="menu-item" onClick={() => navigate("/homepage")}>
                    <img src={homeIcon} alt="Home" />
                    <span>Home</span>
                </div>
                <div className="menu-item" onClick={() => navigate("/user")}>
                    <img src={profileIcon} alt="Profile" />
                    <span>Profile</span>
                </div>
                <div className="menu-item">
                    <img src={supportIcon} alt="Support" />
                    <span>Support</span>
                </div>

                {/* כפתור ה-Connect Instagram הוסר מה-Sidebar
                    הוא עבר ל-BusinessProfileForm
                */}
            </div>
            <div className="logout-button" onClick={handleLogout}>
                <span>Logout</span>
            </div>
        </div>
    );
};

export default Sidebar;