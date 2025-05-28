import React, { useState } from 'react';
import LoginForm from '../../components/LoginForm/LoginForm';
import RegisterForm from '../../components/RegisterForm/RegisterForm';
import './LoginPage.css';
import logo from '../../Images/Logo2.png';

const LoginPage: React.FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);

    const toggleForm = () => {
        setIsRegistering(!isRegistering);
    };

    return (
        <>
            <div
                className="background-image"
                style={{
                    backgroundImage: 'url("/socialai_login_background.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                }}
            />

            <div className="video-overlay" />

            <div className="login-page">
                <div className="logo-container">
                    <img src={logo} alt="Logo" className="login-logo" />
                    <h2 className="welcome-text">
                        Effortlessly schedule, manage, and optimize your social media posts with the power of AI
                    </h2>
                </div>

                {isRegistering ? (
                    <RegisterForm toggleForm={toggleForm} />
                ) : (
                    <LoginForm toggleForm={toggleForm} />
                )}
            </div>
        </>
    );
};

export default LoginPage;
