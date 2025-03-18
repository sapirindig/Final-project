import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import "./Navbar.css";
import { pages } from "../../router";
import logo from "../../assets/logo.png";
import { AuthContext } from "../../contexts/AuthContext";

export const Navbar = () => {
    const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        navigate('/');
    };

    if (!isLoggedIn) {
        return null;
    };

    return (
        <div>
            <nav className="navbar navbar-expand navbar-light justify-content-between">
                <div className="navbar">
                    <a className="" href="/">
                        <img src={logo} id="logo" />
                    </a>
                    <ul className="navbar-nav mr-auto">
                        {pages.map((page) => (
                            <li className="nav-item" key={page.path}>
                                {page.name === "Logout" ? (
                                    <NavLink
                                        to={page.path}
                                        style={({ isActive }) => ({
                                            textDecoration: isActive ? "underline" : "none",
                                        })}
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? "active" : ""}`
                                        }
                                        onClick={handleLogout}
                                    >
                                        {page.name}
                                    </NavLink>
                                ) : (
                                    <NavLink
                                        to={page.path}
                                        style={({ isActive }) => ({
                                            textDecoration: isActive ? "underline" : "none",
                                        })}
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? "active" : ""}`
                                        }
                                    >
                                        {page.name}
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </div>
    );
};