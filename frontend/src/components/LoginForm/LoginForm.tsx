import React, { useContext, useState } from 'react'
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Swal from 'sweetalert2';
import { StatusCodes } from 'http-status-codes';
import './LoginForm.css';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';


interface LoginFormProps {
    toggleForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ toggleForm }) => {
    const { setIsLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await api.login(email, password);

            if (response) {
                if (response.status === StatusCodes.OK) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                    setIsLoggedIn(true);
                    navigate('/homePage');
                } else if (response.status === StatusCodes.BAD_REQUEST) {
                    Swal.fire('Error', 'Invalid credentials', 'error');
                }
            }
        } catch (error) {
            Swal.fire('Error', 'An error occurred during login.', 'error');
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            try {
                const response = await api.googleLogin(credentialResponse.credential);

                if (response && response.status === StatusCodes.OK) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                    setIsLoggedIn(true);
                    navigate('/homePage');
                } else {
                    Swal.fire('Error', 'An error occurred during Google login.', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'An error occurred during Google login.', 'error');
            }
        }
    };

    return (
        <div className="login-form-container d-flex justify-content-center align-items-center vh-100">
            <div className="login-form card p-4">
                <h1 className="card-title text-center">Login</h1>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password:</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-login w-100 mb-2 rounded-pill">Login</button>
                    <button type="button" className="btn btn-register w-100 rounded-pill" onClick={toggleForm}>Register</button>
                    <div className="google-login-wrapper">
                        <GoogleLogin 
                            onSuccess={handleGoogleLoginSuccess}
                            onError={() => Swal.fire('Error', 'An error occurred during Google login.', 'error')}
                            shape='pill'
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;