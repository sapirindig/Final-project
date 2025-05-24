import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatBox from "../../components/ChatBox/ChatBox";
import { generatePostFromAI } from "../../api/openai";
import { fetchSuggestions } from "../../api/aiSuggestions";
import "./CreateContentPage.css";
import {
  AiOutlinePlayCircle,
  AiOutlineTag,
  AiOutlineArrowRight,
  AiOutlineLoading,
} from "react-icons/ai";
import { BsChatLeftText, BsImageFill } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { BiText } from "react-icons/bi";
import sendIcon from "../../Images/white-send.png";

const CreateContentPage = () => {
  const [keywords, setKeywords] = useState("");
  const [keywordMessages, setKeywordMessages] = useState<{ text: string }[]>([]);
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [selectedWritingStyle, setSelectedWritingStyle] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);

  const contentTypes = ["Post", "Story", "Reel"];
  const writingStyles = ["Professional", "Humorous", "Inspiring", "Casual"];
  const concepts = ["Behind the Scenes", "Tips", "Q&A", "Promotion"];
  const lengths = ["Short", "Medium", "Long"];

  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAISuggestions, setLoadingAISuggestions] = useState(true);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);

  // Simulate Instagram connection
  useEffect(() => {
    setTimeout(() => setIsInstagramConnected(true), 500);
  }, []);

  // Fetch AI Suggestions
  useEffect(() => {
    if (isInstagramConnected) {
      const fetchFromApi = async () => {
        try {
          const user = JSON.parse(
            localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
          );
          const token = user?.token;
          if (!token) {
            console.warn("No token found");
            return;
          }
  
          const data = await fetchSuggestions(token);
          setAiSuggestions(data); // זה מה שמשפיע על ההצגה במסך
        } catch (err) {
          console.error("Error loading suggestions", err);
        } finally {
          setLoadingAISuggestions(false);
        }
      };
  
      setLoadingAISuggestions(true);
      fetchFromApi();
    }
  }, [isInstagramConnected]);
  

  const handleSubmitKeywords = () => {
    if (keywords.trim()) {
      setKeywordMessages((prev) => [...prev, { text: keywords }]);
      setKeywords("");
    }
  };

  const handleGenerateContent = async () => {
    const trimmed = keywords.trim();
    if (!trimmed && keywordMessages.length === 0) {
      alert("Please enter some keywords.");
      return;
    }

    const allKeywords = [...keywordMessages.map((msg) => msg.text), ...(trimmed ? [trimmed] : [])].join(", ");
    setIsLoading(true);

    try {
      if (trimmed) {
        setKeywordMessages((prev) => [...prev, { text: trimmed }]);
      }

      const post = await generatePostFromAI({
        keywords: allKeywords,
        contentType: selectedContentType ?? "",
        writingStyle: selectedWritingStyle ?? "",
        concept: selectedConcept ?? "",
        length: selectedLength ?? "",
      });

      setGeneratedPost(post);
      setKeywords("");
    } catch (error) {
      console.error("Error generating content:", error);
      alert("There was an error generating the post.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <Sidebar className="sidebar" />
      <div className="main-content">
        <div className="header-container">
          <h1>Create a Post</h1>
          <p className="subtitle">
            Let our smart AI help you create engaging content for your Instagram.
          </p>
        </div>

        <div className="section">
          <h2 className="section-title">Talk with AI</h2>
          <ChatBox />
        </div>

        <div className="section ai-content-section">
          <div className="ai-generated-content">
            <h2>Let AI Write for You!</h2>
            <div className="details">
              Share your content preferences and key points — get tailored, ready-to-use content instantly.
            </div>

            <div className="keyword-messages-container">
              {keywordMessages.map((msg, index) => (
                <div key={index} className="keyword-message">{msg.text}</div>
              ))}
            </div>

            <div className="keywords-input-area">
              <input
                type="text"
                className="keywords-input"
                placeholder="Enter keywords..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
              <button onClick={handleSubmitKeywords} className="generate-button" disabled={isLoading}>
                {isLoading ? <AiOutlineLoading className="loading-icon" /> : <img src={sendIcon} alt="Send" />}
              </button>
            </div>

            <div className="generate-post-container">
              <button onClick={handleGenerateContent} className="generate-post-button" disabled={isLoading}>
                {isLoading ? <AiOutlineLoading className="loading-icon" /> : "GENERATE POST"}
              </button>
            </div>

            {generatedPost && (
              <div className="generated-post-preview">
                <h3>Generated Post Preview:</h3>
                <div className="post-content-box">{generatedPost}</div>
              </div>
            )}
          </div>

          <div className="filter-options">
            <ul>
              <li onClick={() => setSelectedContentType((prev) => (prev ? null : contentTypes[0]))}>
                <BsChatLeftText className="icon" /> Content Type
              </li>
              <li onClick={() => setSelectedWritingStyle((prev) => (prev ? null : writingStyles[0]))}>
                <FiEdit className="icon" /> Writing Style
              </li>
              <li onClick={() => setSelectedConcept((prev) => (prev ? null : concepts[0]))}>
                <AiOutlineTag className="icon" /> Concept
              </li>
              <li onClick={() => setSelectedLength((prev) => (prev ? null : lengths[0]))}>
                <BiText className="icon" /> Length
              </li>
            </ul>
          </div>
        </div>

        <div className="suggested-content">
          <h2>Suggested Content</h2>
          {loadingAISuggestions ? (
            <div className="loading-suggestions">
              <AiOutlineLoading className="loading-icon" /> Loading content suggestions...
            </div>
          ) : aiSuggestions.length === 0 ? (
            <p className="no-suggestions-message">No suggestions found.</p>
          ) : (
            <ul>
              {aiSuggestions.map((item) => (
                <li key={item._id}>
                  <div className="suggestion-info">
                    <span className="suggestion-type">
                      {item.contentType === "Story" ? <AiOutlinePlayCircle /> : <BsImageFill />}
                      {item.contentType}
                    </span>
                    <strong>{item.title}</strong>
                    <p>{item.content}</p>

                    {item.imageUrls && (
                      <div className="suggestion-images">
                        {item.imageUrls.map((url: string, index: number) => (
                          <img key={index} src={url} alt={`Suggestion ${index}`} style={{ width: "100px", borderRadius: "8px", marginRight: "10px" }} />
                        ))}
                      </div>
                    )}

                    {item.hashtags && item.hashtags.length > 0 && (
                      <div className="tags">
                        {item.hashtags.map((tag: string) => (
                          <span className="tag" key={tag}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    className="create-button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${item.title}\n\n${item.content}`);
                      alert("Copied to clipboard!");
                    }}
                  >
                    Copy
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateContentPage;