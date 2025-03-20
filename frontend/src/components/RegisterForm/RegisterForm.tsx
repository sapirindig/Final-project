import React, { useState } from 'react';
import api from '../../api/api';
import { StatusCodes } from 'http-status-codes';
import Swal from 'sweetalert2';
import './RegisterForm.css';

interface RegisterFormProps {
    toggleForm: () => void;
};

const RegisterForm: React.FC<RegisterFormProps> = ({ toggleForm }) => {
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
                    Swal.fire('Success', 'Registration successful!', 'success').then(toggleForm);
                } else if (response.status === StatusCodes.CONFLICT) {
                    Swal.fire('Error', 'User already exists!', 'error');
                }
            }
        } catch (error) {
            Swal.fire('Error', 'An error occurred during registration.', 'error');
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