import OpenAI from "openai";
import { IBusinessProfile } from "../models/business_profile_model";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateContentFromProfile(
  profile: IBusinessProfile,
  count: number = 3
): Promise<any[]> {
  const prompt = `
Create ${count} social media content suggestions in JSON format.
Each item should include:
- title (string)
- content (string)
- hashtags (array of strings) based on: "${profile.hashtagsStyle}", "${profile.keywords}", "${profile.customHashtags}"
- contentType (one of: ${profile.contentTypes.join(", ") || "Post"})

Business Info:
Business Type: ${profile.businessType}
Tone: ${profile.toneOfVoice}
Audience: ${profile.audienceType}
Marketing Goals: ${profile.marketingGoals.join(", ")}
Post Length: ${profile.postLength}
Use Emojis: ${profile.emojisAllowed ? "Yes" : "No"}, Favorites: ${profile.favoriteEmojis.join(" ")}

Return only a valid JSON array of objects.
`;

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const raw = chatCompletion.choices[0].message?.content ?? "[]";

  try {
    const suggestions = JSON.parse(raw);

    const validTypes = ["Post", "Story", "Reel", "Newsletter"];

    for (const suggestion of suggestions) {
      if (!validTypes.includes(suggestion.contentType)) {
        suggestion.contentType = "Post";
      }

      const imagePrompt = `${profile.businessType} - ${suggestion.title}`;
      try {
        const imageResponse = await openai.images.generate({
          prompt: imagePrompt,
          n: 2,
          size: "512x512",
        });

        suggestion.imageUrls = Array.isArray(imageResponse.data)
          ? imageResponse.data.map((img: any) => img.url)
          : [];
      } catch (imageError) {
        console.warn("🔁 Failed to generate image, fallback to default", imageError);
        suggestion.imageUrls = [];
      }
    }

    return suggestions;
  } catch (err) {
    console.error("⚠️ Failed to parse AI response", err);
    return [];
  }
}