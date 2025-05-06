import React, { useState } from 'react';
import { generatePostFromAI } from '../api/openai';
import axios from 'axios'; // ← חדש

const PostGenerator = () => {
  const [keywords, setKeywords] = useState('');
  const [contentType, setContentType] = useState('Instagram post');
  const [writingStyle, setWritingStyle] = useState('Neutral');
  const [concept, setConcept] = useState('General');
  const [length, setLength] = useState('Medium');

  const [generatedPost, setGeneratedPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // ← חדש

  const handleGenerateContent = async () => {
    console.log('Button clicked');
    if (keywords.trim()) {
        setKeywordMessages((prev) => [...prev, { text: keywords }]);
  
        // שליחת מילות המפתח והפילטרים ל-AI
        const post = await generatePostFromAI({
            keywords,
            contentType: contentType ?? "",
            writingStyle: writingStyle ?? "",
            concept: concept ?? "",
            length: length ?? "",
        });
  
        // הצגת התוצאה (הפוסט שנוצר)
        console.log("Generated Post:", post);
  
        // הצגת הפוסט שנוצר בממשק
        alert(post);
  
        // לאחר השליחה, נקה את שדה מילות המפתח
        setKeywords("");
    }
  };
  

  const handlePublish = async () => {
    try {
      await axios.post('http://localhost:3000/api/posts', {
        content: generatedPost,
        tags: keywords.split(',').map((kw) => kw.trim()),
        category: concept,
        platform: contentType,
      });
      setSuccessMessage('✅ הפוסט פורסם בהצלחה!');
      setGeneratedPost('');
      setKeywords('');
    } catch (error) {
      console.error('שגיאה בפרסום הפוסט:', error);
      setSuccessMessage('❌ אירעה שגיאה בפרסום הפוסט.');
    }
  };

    function handleGenerate(event: React.MouseEvent<HTMLButtonElement>): void {
        throw new Error('Function not implemented.');
    }

  return (
    <div className="post-generator">
      <h3>Generate AI Post</h3>

      <input
        type="text"
        placeholder="Keywords (comma separated)"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
      />

      <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
        <option>Instagram post</option>
        <option>Tweet</option>
        <option>Facebook post</option>
      </select>

      <select value={writingStyle} onChange={(e) => setWritingStyle(e.target.value)}>
        <option>Neutral</option>
        <option>Funny</option>
        <option>Inspirational</option>
      </select>

      <select value={concept} onChange={(e) => setConcept(e.target.value)}>
        <option>General</option>
        <option>Technology</option>
        <option>Fashion</option>
      </select>

      <select value={length} onChange={(e) => setLength(e.target.value)}>
        <option>Short</option>
        <option>Medium</option>
        <option>Long</option>
      </select>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Post'}
      </button>

      {generatedPost && (
        <div className="generated-post">
          <h4>Generated Post:</h4>
          <p>{generatedPost}</p>
          <button onClick={handlePublish}>📤 פרסם את הפוסט</button>
        </div>
      )}

      {successMessage && <p>{successMessage}</p>}
    </div>
  );
};

export default PostGenerator;
function setKeywordMessages(arg0: (prev: any) => any[]) {
    throw new Error('Function not implemented.');
}

