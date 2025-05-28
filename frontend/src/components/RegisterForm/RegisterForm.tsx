import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { StatusCodes } from 'http-status-codes';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext'; // ייבאו את useAuth
import './RegisterForm.css';

interface RegisterFormProps {
    toggleForm: () => void;
};

const RegisterForm: React.FC<RegisterFormProps> = ({ toggleForm }) => {
    const navigate = useNavigate();
    const { login } = useAuth(); // השתמשו ב-useAuth כדי לקבל את פונקציית login

    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Username:', username);
        console.log('Email:', email);
        console.log('Password:', password);

        try {
            const response = await api.register(username, email, password);

            if (response) {
                console.log(`Status: ${response.status}`);
                if (response.status === StatusCodes.CREATED) {
                    // *** צעד קריטי: סמנו את המשתמש כמחובר בקונטקסט ***
                    // זה מבטיח שהסטייט של isLoggedIn מתעדכן ל-true
                    login(); 

                    Swal.fire('Success', 'הרשמה מוצלחת!', 'success').then(() => {
                        console.log("RegisterForm: Registration successful, navigating to /business-profile");
                        navigate('/business-profile'); // ניווט לדף טופס הביזנס
                    });
                } else if (response.status === StatusCodes.CONFLICT) {
                    Swal.fire('Error', 'משתמש כבר קיים!', 'error');
                } else {
                    // טיפול בשגיאות אחרות שאינן CONFLICT
                    Swal.fire('Error', 'שגיאה בהרשמה. אנא נסה שוב.', 'error');
                }
            } else {
                // טיפול במקרה שבו response הוא null/undefined (לדוגמה, כשאין חיבור)
                Swal.fire('Error', 'לא התקבלה תגובה מהשרת. אנא נסה שוב.', 'error');
            }
        } catch (error) {
            console.error("Register API Error:", error); // הדפיסו את השגיאה המלאה לקונסול
            Swal.fire('Error', 'אירעה שגיאה במהלך ההרשמה.', 'error');
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