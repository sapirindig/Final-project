import React, { useState } from "react";
import "./SupportPage.css";
import plusIcon from "../../Images/plus.png";

const faqs = [
  {
    question: "How do I create content with SOCIAL.AI?",
    answer: "Go to 'Create Content' in the sidebar, fill in your business info, and click 'Generate'."
  },
  {
    question: "Can I edit the AI-generated content?",
    answer: "Yes! After content is generated, you can edit the text before posting or saving."
  },
  {
    question: "Is there a limit on content generations per day?",
    answer: "Yes, free accounts are limited to 5 generations per day. Premium users have unlimited access."
  },
  {
    question: "Can I upload my own images?",
    answer: "Of course. You can upload images when creating or editing posts."
  },
  {
    question: "What kind of businesses can use SOCIAL.AI?",
    answer: "Any! Our platform is flexible for shops, services, influencers, and more."
  },
  {
    question: "Can I download my posts?",
    answer: "Yes, you can download posts as image files or copy the text for reuse."
  },
  {
    question: "How do I update my business profile?",
    answer: "Go to 'Profile' in the sidebar and edit your business details."
  },
  {
    question: "How secure is my data?",
    answer: "We use secure encryption and never share your data with third parties."
  },
  {
    question: "Can I use SOCIAL.AI on mobile?",
    answer: "Yes, our platform is fully responsive and mobile-friendly."
  },
  {
    question: "Where can I get support?",
    answer: "You can reach us at support@socialai.app or through the contact form below."
  }
];

const SupportPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="support-container">
      <h1>Support</h1>
      <p className="intro">Need help? Check our FAQs or contact us below.</p>

      <div className="faq-section">
        {faqs.map((faq, index) => (
          <div
            className={`faq-item ${openIndex === index ? "open" : ""}`}
            key={index}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">
              <span>{faq.question}</span>
              <img src={plusIcon} alt="toggle" className="plus-icon" />
            </div>
            {openIndex === index && <div className="faq-answer">{faq.answer}</div>}
          </div>
        ))}
      </div>

      <div className="contact-form">
        <h2>Contact Us</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows={5} required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default SupportPage;