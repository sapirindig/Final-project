import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Swal from 'sweetalert2';
import { StatusCodes } from 'http-status-codes';
import { useAuth } from '../../contexts/AuthContext'; // ייבאו את useAuth (במקום useContext)
import './LoginForm.css';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';

interface LoginFormProps {
    toggleForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ toggleForm }) => {
    // השתמשו ב-useAuth כדי לקבל את פונקציית login
    const { login } = useAuth(); // שינוי מ-setIsLoggedIn = useContext(AuthContext)
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
                    // *** צעד קריטי: סמנו את המשתמש כמחובר בקונטקסט ***
                    login(); // שינוי מ-setIsLoggedIn(true);
                    console.log("LoginForm: Login successful, navigating to /business-profile"); // שיניתי את הנתיב ל-business-profile
                    navigate('/business-profile'); // שינוי מ-navigate('/homePage');
                } else if (response.status === StatusCodes.BAD_REQUEST) {
                    Swal.fire('Error', 'פרטי התחברות שגויים!', 'error');
                } else {
                    // טיפול בשגיאות אחרות
                    Swal.fire('Error', 'שגיאה בהתחברות. אנא נסה שוב.', 'error');
                }
            } else {
                Swal.fire('Error', 'לא התקבלה תגובה מהשרת. אנא נסה שוב.', 'error');
            }
        } catch (error) {
            console.error("Login API Error:", error);
            Swal.fire('Error', 'אירעה שגיאה במהלך ההתחברות.', 'error');
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            try {
                const response = await api.googleLogin(credentialResponse.credential);

                if (response && response.status === StatusCodes.OK) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                    // *** צעד קריטי: סמנו את המשתמש כמחובר בקונטקסט ***
                    login(); // שינוי מ-setIsLoggedIn(true);
                    console.log("LoginForm: Google Login successful, navigating to /business-profile"); // שיניתי את הנתיב
                    navigate('/business-profile'); // שינוי מ-navigate('/homePage');
                } else {
                    Swal.fire('Error', 'אירעה שגיאה במהלך התחברות Google.', 'error');
                }
            } catch (error) {
                console.error("Google Login API Error:", error);
                Swal.fire('Error', 'אירעה שגיאה במהלך התחברות Google.', 'error');
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
                            onError={() => Swal.fire('Error', 'אירעה שגיאה במהלך התחברות Google.', 'error')}
                            shape='pill'
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;