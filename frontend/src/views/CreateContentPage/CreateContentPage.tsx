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
import { useState, useEffect } from "react";
import sendIcon from "../../Images/white-send.png";

type SuggestedItem = {
    id: string;
    type: "post" | "story";
    title: string;
    engagementScore?: number;
    tags?: string[];
    action?: () => void;
};

type KeywordMessage = {
    text: string;
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

    const [keywords, setKeywords] = useState<string>("");
    const [keywordMessages, setKeywordMessages] = useState<KeywordMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [generatedPost, setGeneratedPost] = useState<string | null>(null); // 🆕 שמירת הפוסט שנוצר

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

    const handleSubmitKeywords = () => {
        if (keywords.trim()) {
            setKeywordMessages((prev) => [...prev, { text: keywords }]);
            setKeywords("");
        }
    };

    const handleGenerateContent = async () => {
    const trimmed = keywords.trim();

    // בדיקה אם יש מילים אחרונות בשדה או הודעות שהוזנו בעבר
    if (!trimmed && keywordMessages.length === 0) {
        alert("Please enter some keywords.");
        return;
    }

    // איחוד כל מילות המפתח מהשדה הנוכחי ומההיסטוריה
    const allKeywords = [
        ...keywordMessages.map((msg) => msg.text),
        ...(trimmed ? [trimmed] : [])
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
        setKeywords(""); // נקה את השדה לאחר שליחה
    } catch (error) {
        console.error("Error generating content:", error);
        alert("There was an error generating the post. Please try again.");
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
                        <div className="keywords-input-area">
                            <input
                                type="text"
                                className="keywords-input"
                                placeholder="Enter keywords or phrases you want in the post..."
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
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

                        <div className="generate-post-container">
                            <button
                                onClick={handleGenerateContent}
                                className="generate-post-button"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <AiOutlineLoading className="loading-icon" />
                                ) : (
                                    "GENERATE POST"
                                )}
                            </button>
                        </div>

                        {/* ✅ תצוגה מקדימה של הפוסט שנוצר */}
                        {generatedPost && (
                            <div className="generated-post-preview">
                                <h3>Generated Post Preview:</h3>
                                <div className="post-content-box">
                                    {generatedPost}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="filter-options">
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
                                            {selectedContentType === type ? "✅ " : ""}
                                            {type}
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
                                            {selectedWritingStyle === style ? "✅ " : ""}
                                            {style}
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
                                            {selectedConcept === concept ? "✅ " : ""}
                                            {concept}
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
                                            {selectedLength === length ? "✅ " : ""}
                                            {length}
                                        </li>
                                    ))}
                                </ul>
                            )}
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
