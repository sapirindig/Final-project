import React from 'react';
import './Footer.css';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
import logo from './Social.png';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section logo-section">
        <img src={logo} alt="AI Social Logo" className="footer-logo" />
        <p> Social, but smarter</p>
        </div>
        <div className="footer-section links-section">
          <h4>שירות ומידע</h4>
          <ul>
            <li><a href="/contact">צור קשר</a></li>
            <li><a href="/about">אודות</a></li>
            <li><a href="/terms">תקנון האתר</a></li>
            <li><a href="/faq">שאלות נפוצות</a></li>
          </ul>
        </div>
        <div className="footer-section contact-section">
          <h4>צור קשר</h4>
          <p>טלפון: *6808</p>
          <p>דוא"ל: support@aisocial.com</p>
          <div className="social-icons">
            <a href="https://www.facebook.com" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://www.instagram.com" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://www.youtube.com" aria-label="YouTube"><FaYoutube /></a>
            <a href="https://www.tiktok.com" aria-label="TikTok"><FaTiktok /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 AI Social. כל הזכויות שמורות.</p>
      </div>
    </footer>
  );
};

export default Footer;
