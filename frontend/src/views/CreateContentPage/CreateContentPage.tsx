import Sidebar from "../../components/Sidebar/Sidebar";
import ChatBox from "../../components/ChatBox/ChatBox";
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
import { useState, useEffect } from "react";

// Data type for a suggestion
type SuggestedItem = {
  id: string;
  type: "post" | "story";
  title: string;
  engagementScore?: number;
  tags?: string[];
  action?: () => void;
};

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

  const contentTypes = ["Post", "Story", "Reel"];
  const writingStyles = ["Professional", "Humorous", "Inspiring", "Casual"];
  const concepts = ["Behind the Scenes", "Tips", "Q&A", "Promotion"];
  const lengths = ["Short", "Medium", "Long"];

  useEffect(() => {
    setTimeout(() => {
      setIsInstagramConnected(true);
    }, 500);
  }, []);

  useEffect(() => {
    if (isInstagramConnected) {
      setIsLoadingSuggestions(true);
      setTimeout(() => {
        setSuggestedContent([
          {
            id: "1",
            type: "post",
            title: "Tips for Effective Instagram Marketing",
            engagementScore: 85,
            tags: ["tips", "marketing", "instagram"],
            action: () => console.log("Create Post 1"),
          },
          {
            id: "2",
            type: "story",
            title: "Q&A Session with Your Followers",
            engagementScore: 78,
            tags: ["story", "questions", "engagement"],
            action: () => console.log("Create Story 2"),
          },
          {
            id: "3",
            type: "post",
            title: "Behind the Scenes of Your Business",
            engagementScore: 92,
            tags: ["post", "authenticity", "business"],
            action: () => console.log("Create Post 3"),
          },
        ]);
        setIsLoadingSuggestions(false);
      }, 1500);
    } else {
      setIsLoadingSuggestions(false);
      setSuggestedContent([]);
    }
  }, [isInstagramConnected]);

  return (
    <div className="container">
      <Sidebar className="sidebar" />
      <div className="main-content">
        <div className="header-container">
          <h1>Create New Content</h1>
          <p className="subtitle">
            Let our smart AI help you create engaging content for your Instagram.
          </p>
          {!isInstagramConnected && (
            <p className="connect-instagram-message">
              Please connect your Instagram account to see personalized content suggestions.
            </p>
          )}
        </div>

        <ChatBox />

        <div className="ai-content-section">
          <div className="ai-generated-content">
            <h2>AI Content Ideas</h2>
            <div className="preview">
              <AiOutlinePlayCircle />
            </div>
            <div className="details">
              Engaging Post Idea
              <br />
              Share a carousel post showcasing your top 3 best-selling products.
            </div>
          </div>

          <div className="filter-options">
            <h2>Filter options</h2>
            <ul>
              <li onClick={() => setShowContentTypeOptions(!showContentTypeOptions)}>
                <BsChatLeftText className="icon" /> Content Type
              </li>
              {showContentTypeOptions && (
                <ul className="sub-options">
                  {contentTypes.map((type) => (
                    <li
                      key={type}
                      onClick={() => setSelectedContentType(type)}
                      className={selectedContentType === type ? "selected" : ""}
                    >
                      {selectedContentType === type ? "✅ " : ""}{type}
                    </li>
                  ))}
                </ul>
              )}

              <li onClick={() => setShowWritingStyleOptions(!showWritingStyleOptions)}>
                <FiEdit className="icon" /> Writing Style
              </li>
              {showWritingStyleOptions && (
                <ul className="sub-options">
                  {writingStyles.map((style) => (
                    <li
                      key={style}
                      onClick={() => setSelectedWritingStyle(style)}
                      className={selectedWritingStyle === style ? "selected" : ""}
                    >
                      {selectedWritingStyle === style ? "✅ " : ""}{style}
                    </li>
                  ))}
                </ul>
              )}

              <li onClick={() => setShowConceptOptions(!showConceptOptions)}>
                <AiOutlineTag className="icon" /> Concept
              </li>
              {showConceptOptions && (
                <ul className="sub-options">
                  {concepts.map((concept) => (
                    <li
                      key={concept}
                      onClick={() => setSelectedConcept(concept)}
                      className={selectedConcept === concept ? "selected" : ""}
                    >
                      {selectedConcept === concept ? "✅ " : ""}{concept}
                    </li>
                  ))}
                </ul>
              )}

              <li onClick={() => setShowLengthOptions(!showLengthOptions)}>
                <BiText className="icon" /> Length
              </li>
              {showLengthOptions && (
                <ul className="sub-options">
                  {lengths.map((length) => (
                    <li
                      key={length}
                      onClick={() => setSelectedLength(length)}
                      className={selectedLength === length ? "selected" : ""}
                    >
                      {selectedLength === length ? "✅ " : ""}{length}
                    </li>
                  ))}
                </ul>
              )}

              <li>
                <AiOutlineArrowRight className="icon" /> Forwards
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
          ) : (
            <ul>
              {suggestedContent.map((item) => (
                <li key={item.id}>
                  <div className="suggestion-info">
                    <span className="suggestion-type">
                      {item.type === "post" ? <BsImageFill /> : <AiOutlinePlayCircle />}
                      {item.type === "post" ? "Post" : "Story"}
                    </span>
                    {item.title}
                    {item.engagementScore && (
                      <span className="engagement">❤️ {item.engagementScore}%</span>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="tags">
                        {item.tags.map((tag) => (
                          <span className="tag" key={tag}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="create-button" onClick={item.action}>
                    Create
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
