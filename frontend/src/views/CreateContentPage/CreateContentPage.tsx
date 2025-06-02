import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatBox from "../../components/ChatBox/ChatBox";
import { generatePostFromAI } from "../../api/openai";
import { fetchSuggestions } from "../../api/aiSuggestions";
import "./CreateContentPage.css";
import {
  AiOutlinePlayCircle,
  AiOutlineTag,
  AiOutlineLoading,
} from "react-icons/ai";
import { BsChatLeftText, BsImageFill } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { BiText } from "react-icons/bi";
import sendIcon from "../../Images/white-send.png";
import Spinner from "../../components/Spinner/Spinner";

// Define the KeywordMessage type
type KeywordMessage = {
  text: string;
};

// Define the SuggestedItem type
type SuggestedItem = {
  _id: string;
  contentType: "Post" | "Story" | "Reel" | string;
  title: string;
  content: string;
  engagementScore?: number;
  tags?: string[];
  hashtags?: string[];
  imageUrls?: string[];
};

const CreateContentPage = () => {
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedItem[]>([]);
  const [loadingAISuggestions, setLoadingAISuggestions] = useState(true);
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

  // Simulate Instagram connection after 0.5s
  useEffect(() => {
    setTimeout(() => {
      setIsInstagramConnected(true);
    }, 500);
  }, []);

  // Fetch AI suggestions once Instagram is connected
  useEffect(() => {
    const fetchFromApi = async () => {
      setLoadingAISuggestions(true);
      try {
        const user = JSON.parse(
          localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
        );
        const token = user?.token;
        if (!token) {
          console.warn("No token found. Cannot fetch AI suggestions.");
          setAiSuggestions([]);
          return;
        }

        const data = await fetchSuggestions(token);

        if (data && Array.isArray(data.suggestions)) {
          setAiSuggestions(data.suggestions);
        } else if (Array.isArray(data)) {
          setAiSuggestions(data);
        } else {
          console.warn("API response for suggestions was not an array or expected object structure:", data);
          setAiSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching suggested posts:", error);
        setAiSuggestions([]);
      } finally {
        setLoadingAISuggestions(false);
      }
    };

    if (isInstagramConnected) {
      fetchFromApi();
    } else {
      setAiSuggestions([]);
      setLoadingAISuggestions(false);
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

    const allKeywords = [
      ...keywordMessages.map((msg) => msg.text),
      ...(trimmed ? [trimmed] : []),
    ].join(", ");

    setIsLoading(true);
    setGeneratedPost(null);

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
      alert("There was an error generating the post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeOtherDropdowns = (except: string) => {
    if (except !== "contentType") setShowContentTypeOptions(false);
    if (except !== "writingStyle") setShowWritingStyleOptions(false);
    if (except !== "concept") setShowConceptOptions(false);
    if (except !== "length") setShowLengthOptions(false);
  };

  const handlePostToInstagram = async (item: SuggestedItem) => {
    const user = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
    );
    const token = user?.token;

    if (!token) {
      alert("You must be logged in to post to Instagram.");
      return;
    }

    try {
      if (!item.imageUrls || item.imageUrls.length === 0) {
        alert("No image available to post to Instagram.");
        return;
      }

      const imageResponse = await fetch(item.imageUrls[0]);
      const imageBlob = await imageResponse.blob();

      const file = new File([imageBlob], "instagram-image.jpg", { type: imageBlob.type });

      const formData = new FormData();
      formData.append("caption", item.content);
      formData.append("image", file);

      const response = await fetch(`http://localhost:3000/instagram/post`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to post to Instagram.");
      }

      alert("Post successfully published to Instagram!");
    } catch (error) {
      console.error("Instagram post error:", error);
      alert("There was a problem posting to Instagram.");
    }
  };

  return (
    <div className="container">
      {isLoading && <Spinner />}

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

            <div className="inputs-filters-container">
              <div className="keywords-input-area">
                <input
                  type="text"
                  className="keywords-input"
                  placeholder="Enter keywords or phrases you want in the post..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSubmitKeywords();
                    }
                  }}
                />
                <button
                  onClick={handleSubmitKeywords}
                  className="generate-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <AiOutlineLoading className="loading-icon" />
                  ) : (
                    <img src={sendIcon} alt="Send" />
                  )}
                </button>
              </div>

              <div className="filter-options">
                <ul>
                  {/* Content Type Filter */}
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

                  {/* Writing Style Filter */}
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

                  {/* Concept Filter */}
                  <li
                    onClick={() => {
                      closeOtherDropdowns("concept");
                      setShowConceptOptions(!showConceptOptions);
                    }}
                    className="filter-header"
                  >
                    <AiOutlineTag className="icon" /> Concept:{" "}
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

                  {/* Length Filter */}
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

            {/* Display selected keywords */}
            {keywordMessages.length > 0 && (
              <div className="keyword-messages-display">
                {keywordMessages.map((msg, index) => (
                  <span key={index} className="keyword-tag">{msg.text}</span>
                ))}
              </div>
            )}

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
          {loadingAISuggestions ? (
            <div className="loading-suggestions">
              <AiOutlineLoading className="loading-icon" /> Loading content suggestions...
            </div>
          ) : aiSuggestions.length === 0 ? (
            <p className="no-suggestions-message">No suggestions available.</p>
          ) : (
            <ul className="suggested-content-list">
              {aiSuggestions.map((item) => (
                <li key={item._id} className="suggestion-card">
                  <div className="suggestion-info">
                    <span className="suggestion-type">
                      {item.contentType === "Story" ? <AiOutlinePlayCircle /> : <BsImageFill />}
                      {item.contentType}
                    </span>
                    <strong>{item.title}</strong>
                    <p>{item.content}</p>

                    {item.imageUrls && item.imageUrls.length > 0 && (
                      <div className="suggestion-images">
                        {item.imageUrls.map((url: string, index: number) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Suggestion ${index}`}
                            className="suggestion-image"
                          />
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
                    onClick={() => handlePostToInstagram(item)}
                  >
                    POST NOW
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
