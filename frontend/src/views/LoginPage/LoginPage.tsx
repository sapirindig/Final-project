import React, { useState } from 'react';
import LoginForm from '../../components/LoginForm/LoginForm';
import RegisterForm from '../../components/RegisterForm/RegisterForm';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);

    const toggleForm = () => {
        setIsRegistering(!isRegistering);
    };

    return (
        <div className='login-page'>
            {isRegistering ? <RegisterForm toggleForm={toggleForm} /> : <LoginForm toggleForm={toggleForm} />}
            
        </div>
    );
};

export default LoginPage;
