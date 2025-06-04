import React, { useState, useContext } from 'react';
import api from '../../api/api';
import { StatusCodes } from 'http-status-codes';
import Swal from 'sweetalert2';
import './RegisterForm.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

interface RegisterFormProps {
    toggleForm: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ toggleForm }) => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();

    const { login } = useContext(AuthContext); // משתמשים ב-login מהקונטקסט

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await api.register(username, email, password);

            if (response) {
                console.log("RegisterForm - Server response:", response.data); // <--- הוספה לדיבוג

                if (response.status === StatusCodes.CREATED) {
                    Swal.fire('Success', 'Registration successful!', 'success').then(() => {
                        // **התיקון כאן!**
                        // השרת מחזיר את נתוני המשתמש תחת השדה 'user' בתוך response.data
                        const registeredUser = response.data.user;

                        if (registeredUser && registeredUser.token) {
                            console.log("RegisterForm - Registered user data with token:", registeredUser); // <--- הוספה לדיבוג
                            // קריאה לפונקציית login מהקונטקסט עם אובייקט המשתמש המלא
                            login(registeredUser); // נניח שפונקציית login בקונטקסט יודעת לשמור את האובייקט הזה
                            navigate("/business-profile", { replace: true });
                        } else {
                            console.error("RegisterForm - Token or user data missing after successful registration:", response.data);
                            Swal.fire('Error', 'Registration successful, but token not received. Please try logging in.', 'warning');
                            // אולי נווט לדף התחברות במקרה כזה
                            navigate("/login", { replace: true });
                        }
                    });
                } else if (response.status === StatusCodes.CONFLICT) {
                    Swal.fire('Error', 'User already exists!', 'error');
                } else {
                    // טיפול כללי בשגיאות אחרות (לדוגמה, 400 Bad Request מהשרת)
                    // ייתכן שתרצי להציג את ה-response.data.message אם השרת מחזיר כזה
                    Swal.fire('Error', response.data?.message || 'An unexpected error occurred during registration.', 'error');
                }
            }
        } catch (error: any) {
            console.error("RegisterForm - Error during registration:", error.response ? error.response.data : error.message);
            const errorMessage = error.response && error.response.data && error.response.data.message
                                 ? error.response.data.message
                                 : 'An error occurred during registration.';
            Swal.fire('Error', errorMessage, 'error');
        }
    };

    return (
        <div className="register-form-container d-flex justify-content-center align-items-center vh-100">
            <div className="register-form card p-4">
                <h1 className="card-title text-center">Register</h1>
                <form onSubmit={handleRegister}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username:</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
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
                    <button type="submit" className="btn btn-primary w-100 mb-2">Register</button>
                    <button type="button" className="btn btn-secondary w-100" onClick={toggleForm}>Back to Login</button>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;