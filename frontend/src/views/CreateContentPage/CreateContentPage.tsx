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

// Define the KeywordMessage type
type KeywordMessage = {
  text: string;
};

// Define the SuggestedItem type
type SuggestedItem = {
  id: string | number;
  type: "post" | "story" | string;
  title: string;
  content?: string;
  engagementScore?: number;
  tags?: string[];
  hashtags?: string[];
  action?: () => void;
};

const CreateContentPage = () => {
  const [suggestedContent, setSuggestedContent] = useState<SuggestedItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);

  // מוסיף סטייט של פתיחת תפריטים לכל קטגוריה
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

  // פונקציה לעזרה בסגירת שאר התפריטים כשפותחים אחד חדש
  const closeOtherDropdowns = (except: string) => {
    if (except !== "contentType") setShowContentTypeOptions(false);
    if (except !== "writingStyle") setShowWritingStyleOptions(false);
    if (except !== "concept") setShowConceptOptions(false);
    if (except !== "length") setShowLengthOptions(false);
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

                        {/* הוספתי מיכל flex לעטוף את הקלט והפילטרים */}
                        <div className="inputs-filters-container">
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

                            {/* תיבת הפילטרים ממוקמת כעת כאן, לצד תיבת הקלט */}
                            <div className="filter-options">
                                <ul>
                                    <li
                                        onClick={() => {
                                            closeOtherDropdowns("contentType");
                                            setShowContentTypeOptions(!showContentTypeOptions);
                                        }}
                                        className="filter-header"
                                    >
                                        <BsChatLeftText className="icon" /> Content Type:{" "}
                                        <strong>{selectedContentType || "None"}</strong>
                                    </li>
                                    {showContentTypeOptions && (
                                        <ul className="options-list">
                                            {contentTypes.map((type) => (
                                                <li
                                                    key={type}
                                                    className={`option-item ${selectedContentType === type ? "selected" : ""}`}
                                                    onClick={() => {
                                                        setSelectedContentType(type);
                                                        setShowContentTypeOptions(false);
                                                    }}
                                                >
                                                    {type}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <li
                                        onClick={() => {
                                            closeOtherDropdowns("writingStyle");
                                            setShowWritingStyleOptions(!showWritingStyleOptions);
                                        }}
                                        className="filter-header"
                                    >
                                        <FiEdit className="icon" /> Writing Style:{" "}
                                        <strong>{selectedWritingStyle || "None"}</strong>
                                    </li>
                                    {showWritingStyleOptions && (
                                        <ul className="options-list">
                                            {writingStyles.map((style) => (
                                                <li
                                                    key={style}
                                                    className={`option-item ${selectedWritingStyle === style ? "selected" : ""}`}
                                                    onClick={() => {
                                                        setSelectedWritingStyle(style);
                                                        setShowWritingStyleOptions(false);
                                                    }}
                                                >
                                                    {style}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <li
                                        onClick={() => {
                                            closeOtherDropdowns("concept");
                                            setShowConceptOptions(!showConceptOptions);
                                        }}
                                        className="filter-header"
                                    >
                                        <AiOutlinePlayCircle className="icon" /> Concept:{" "}
                                        <strong>{selectedConcept || "None"}</strong>
                                    </li>
                                    {showConceptOptions && (
                                        <ul className="options-list">
                                            {concepts.map((concept) => (
                                                <li
                                                    key={concept}
                                                    className={`option-item ${selectedConcept === concept ? "selected" : ""}`}
                                                    onClick={() => {
                                                        setSelectedConcept(concept);
                                                        setShowConceptOptions(false);
                                                    }}
                                                >
                                                    {concept}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <li
                                        onClick={() => {
                                            closeOtherDropdowns("length");
                                            setShowLengthOptions(!showLengthOptions);
                                        }}
                                        className="filter-header"
                                    >
                                        <BiText className="icon" /> Length: <strong>{selectedLength || "None"}</strong>
                                    </li>
                                    {showLengthOptions && (
                                        <ul className="options-list">
                                            {lengths.map((len) => (
                                                <li
                                                    key={len}
                                                    className={`option-item ${selectedLength === len ? "selected" : ""}`}
                                                    onClick={() => {
                                                        setSelectedLength(len);
                                                        setShowLengthOptions(false);
                                                    }}
                                                >
                                                    {len}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {generatedPost && (
                            <div className="generated-post-preview">
                                <h3>Generated Post Preview:</h3>
                                <div className="post-content-box">{generatedPost}</div>
                            </div>
                        )}

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
                </div>

                <div className="section suggested-content-section">
                    <h2>Suggested Content From Instagram</h2>
                    {isLoadingSuggestions && <p>Loading suggestions...</p>}
                    {!isLoadingSuggestions && suggestedContent.length === 0 && (
                        <p>No suggestions available.</p>
                    )}
                    <ul className="suggested-content-list">
                        {suggestedContent.map((item) => (
                            <li key={item.id} className={`suggested-item suggested-${item.type}`}>
                                <h4>{item.title}</h4>
                                {item.content && <p>{item.content}</p>}
                                {item.engagementScore && (
                                    <p>Engagement Score: {item.engagementScore.toFixed(2)}</p>
                                )}
                                {item.tags && (
                                    <p>
                                        Tags: {item.tags.map((tag) => `#${tag}`).join(", ")}
                                    </p>
                                )}
                                {item.hashtags && (
                                    <p>
                                        Hashtags: {item.hashtags.map((tag) => `#${tag}`).join(", ")}
                                    </p>
                                )}
                                {item.action && (
                                    <button onClick={item.action}>Take Action</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
export default CreateContentPage;
