import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatBox from "../../components/ChatBox/ChatBox";
import { generatePostFromAI } from "../../api/openai";
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
  const [suggestedContent, setSuggestedContent] = useState<SuggestedItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);

  const [showContentTypeOptions, setShowContentTypeOptions] = useState(false);
  const [showWritingStyleOptions, setShowWritingStyleOptions] = useState(false);
  const [showConceptOptions, setShowConceptOptions] = useState(false);
  const [showLengthOptions, setShowLengthOptions] = useState(false);

  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [selectedWritingStyle, setSelectedWritingStyle] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);

  const [keywords, setKeywords] = useState<string>("");
  const [keywordMessages, setKeywordMessages] = useState<KeywordMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [generatedPost, setGeneratedPost] = useState<string | null>(null);

  const contentTypes = ["Post", "Story", "Reel"];
  const writingStyles = ["Professional", "Humorous", "Inspiring", "Casual"];
  const concepts = ["Behind the Scenes", "Tips", "Q&A", "Promotion"];
  const lengths = ["Short", "Medium", "Long"];

  // מדמה חיבור אינסטגרם אחרי חצי שניה
  useEffect(() => {
    setTimeout(() => {
      setIsInstagramConnected(true);
    }, 500);
  }, []);

  // העלאת המלצות תוכן לפי חיבור אינסטגרם
  useEffect(() => {
    const fetchSuggestedContent = async () => {
      setIsLoadingSuggestions(true);
      try {
        // כאן יש להכניס את הלוגיקה לקבלת טוקן אמיתי מהאחסון
        const user = JSON.parse(
          localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
        );
        const token = user?.token;
        if (!token) {
          console.warn("No token found");
          setSuggestedContent([]);
          return;
        }

        const res = await fetch(
          `http://localhost:3001/api/instagram/suggested-posts?accessToken=${token}`
        );
        const data = await res.json();

        if (Array.isArray(data.suggestions)) {
          setSuggestedContent(data.suggestions);
        } else {
          setSuggestedContent([]);
        }
      } catch (error) {
        console.error("Error fetching suggested posts:", error);
        setSuggestedContent([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    if (isInstagramConnected) {
      fetchSuggestedContent();
    } else {
      setSuggestedContent([]);
      setIsLoadingSuggestions(false);
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
      alert("Please enter some keywords."); // הודעת שגיאה מפורטת
      return;
    }

    const allKeywords = [
      ...keywordMessages.map((msg) => msg.text),
      ...(trimmed ? [trimmed] : []),
    ].join(", ");

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
      alert("There was an error generating the post. Please try again."); // הודעת שגיאה מפורטת
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
          {!isInstagramConnected && (
            <p className="connect-instagram-message">
              Please connect your Instagram account to see personalized content suggestions.
            </p>
          )}
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
                <div key={index} className="keyword-message">
                  {msg.text}
                </div>
              ))}
            </div>

            {generatedPost && (
              <div className="generated-post-preview">
                <h3>Generated Post Preview:</h3>
                <div className="post-content-box">{generatedPost}</div>
              </div>
            )}

            <div className="keywords-input-area">
              <input
                type="text"
                className="keywords-input"
                placeholder="Enter keywords or phrases you want in the post..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
              <button onClick={handleSubmitKeywords} className="generate-button" disabled={isLoading}>
                {isLoading ? (
                  <AiOutlineLoading className="loading-icon" />
                ) : (
                  <img src={sendIcon} alt="Send" />
                )}
              </button>
            </div>

            <div className="generate-post-container">
              <button
                onClick={handleGenerateContent}
                className="generate-post-button"
                disabled={isLoading}
              >
                {isLoading ? <AiOutlineLoading className="loading-icon" /> : "GENERATE POST"}
              </button>
            </div>
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
          {!isInstagramConnected ? (
            <p className="no-suggestions-message">
              Connect your Instagram account to view personalized content suggestions here.
            </p>
          ) : isLoadingSuggestions ? (
            <div className="loading-suggestions">
              <AiOutlineLoading className="loading-icon" /> Loading content suggestions...
            </div>
          ) : suggestedContent.length === 0 ? (
            <p className="no-suggestions-message">No suggestions found.</p>
          ) : (
            <ul>
              {suggestedContent.map((item) => (
                <li key={item.id}>
                  <div className="suggestion-info">
                    <span className="suggestion-type">
                      {item.type === "post" ? <BsImageFill /> : <AiOutlinePlayCircle />}
                      {item.type === "post" ? "Post" : "Story"}
                    </span>
                    <strong>{item.title}</strong>
                    {item.engagementScore && (
                      <span className="engagement">❤️ {item.engagementScore}%</span>
                    )}
                    {(item.tags?.length || item.hashtags?.length) > 0 && (
                      <div className="tags">
                        {(item.tags || item.hashtags).map((tag: string) => (
                          <span className="tag" key={tag}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {item.action ? (
                    <button className="create-button" onClick={item.action}>
                      Create
                    </button>
                  ) : (
                    <button
                      className="create-button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${item.title}\n\n${item.content || ""}`);
                        alert("Copied to clipboard!");
                      }}
                    >
                      Copy
                    </button>
                  )}
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
