import React from 'react';
import Sidebar from "../../components/Sidebar/Sidebar"; 
import BusinessProfileForm from '../../components/BusinessProfileForm/BusinessProfileForm';
import './UserPage.css';

export const UserPage: React.FC = () => {
    return (
        <div className="user-page">
            <Sidebar />
            <div className="profile-form-container">
                <BusinessProfileForm />
            </div>
        </div>
    );
};
export default UserPage;