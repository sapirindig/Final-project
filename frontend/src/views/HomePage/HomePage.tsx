import React, { useRef } from 'react';
import './HomePage.css';
import SiteVisits from '../../components/SiteVisits/SiteVisits';
import axios from 'axios';

const postHardcodedToInstagram = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file, file.name);
  formData.append('caption', 'This is a hardcoded caption from HomePage!');

  try {
    const res = await axios.post('http://localhost:3000/instagram/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('Posted to Instagram! ' + JSON.stringify(res.data));
  } catch (err: any) {
    alert('Failed to post: ' + (err.response?.data?.message || err.message));
  }
};

const HomePage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current && fileInputRef.current.files?.[0]) {
      postHardcodedToInstagram(fileInputRef.current.files[0]);
    } else {
      alert('Please select an image file first.');
    }
  };

  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Welcome to the Home Page</h1>
      </header>
      <main className="homepage-main">
        <SiteVisits />
        <input type="file" accept="image/*" ref={fileInputRef} style={{ marginTop: 20 }} />
        <button onClick={handleButtonClick} style={{ marginTop: 20 }}>
          Post Selected Image & Caption to Instagram
        </button>
      </main>
    </div>
  );
};

export default HomePage;