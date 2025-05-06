import axios from 'axios';

type PostGenerationOptions = {
  keywords: string;
  contentType: string;
  writingStyle: string;
  concept: string;
  length: string;
};

export const generatePostFromAI = async ({
  keywords,
  contentType,
  writingStyle,
  concept,
  length,
}: PostGenerationOptions): Promise<string> => {
  const prompt = `Generate a ${length.toLowerCase()} ${contentType.toLowerCase()} post about "${keywords}", written in a ${writingStyle.toLowerCase()} tone, focusing on ${concept.toLowerCase()} theme.`;

  try {
    const res = await axios.post('http://localhost:3000/api/chat/message', {
      message: prompt,
      imageUrl: '', // לא נדרש תמונה
    });

    return res.data.response || 'No response from AI.';
  } catch (err) {
    console.error('Error generating post:', err);
    return 'Error generating post.';
  }
};
