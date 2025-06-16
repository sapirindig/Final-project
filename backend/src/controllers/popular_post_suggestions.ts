import { Request, Response } from "express";
import InstagramContentSuggestion from "../models/InstagramContentSuggestion";
import axios from "axios";
import mongoose from "mongoose";
import { getImageDescription } from "../services/imageDescriptionService";
import OpenAI from "openai";

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || "";
const IG_USER_ID = process.env.IG_USER_ID || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// פונקציה ליצירת תמונה חדשה מה-OpenAI Image API
async function generateNewImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      n: 1,
    });
    const imageUrl =
      response.data && response.data[0] && response.data[0].url
        ? response.data[0].url
        : "";
    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    return "";
  }
}

// פונקציה ראשית ליצירת הצעות מהפוסטים הפופולריים
export const generateSuggestionsFromPopularPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.userId;

  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    res.status(500).json({ error: "Instagram credentials not configured" });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    // בדיקה האם יש הצעות קיימות שנוצרו ב-24 השעות האחרונות
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSuggestions = await InstagramContentSuggestion.find({
      userId,
      source: "instagramProfile",
      createdAt: { $gte: oneDayAgo },
    });

    if (recentSuggestions.length > 0) {
      // אם יש הצעות עדכניות, נחזיר אותן במקום ליצור חדשות
      res.status(200).json(recentSuggestions);
      return;
    }

    // שלב 1: משיכת הפוסטים הפופולריים
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const url = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media?fields=id,caption,media_url,media_type,timestamp,like_count,comments_count&access_token=${IG_ACCESS_TOKEN}`;
    const igRes = await axios.get<{ data: any[] }>(url);

    const topPosts = igRes.data.data
      .filter(
        (p) =>
          p.media_type === "IMAGE" && new Date(p.timestamp) > new Date(thirtyDaysAgo)
      )
      .map((p) => ({
        ...p,
        like_count: Number(p.like_count || 0),
        comments_count: Number(p.comments_count || 0),
        engagement: Number(p.like_count || 0) + Number(p.comments_count || 0),
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 2);

    if (!topPosts.length) {
      res.status(404).json({ error: "No popular posts found" });
      return;
    }

    // שלב 2: יצירת 3 הצעות לכל פוסט
    const suggestions = [];

    for (const post of topPosts) {
      const caption = post.caption || "an Instagram post";

      for (let i = 0; i < 3; i++) {
        // יצירת טקסט לכיתוב חדש בהשראת הפוסט
        const textPrompt = `Generate a new, original Instagram caption inspired by the following post:\n"${caption}"\nKeep the same style and vibe, but do NOT copy the original caption. Suggest something fresh and engaging for a new post.`;

        const aiResponse = await axios.post("http://localhost:3000/api/chat/message", {
          message: textPrompt,
          imageUrl: "",
        });

        const newCaption =
          (aiResponse.data as { response?: string }).response || "No response from AI.";

        // יצירת פרומפט לתמונה חדשה — מתבסס אך ורק על הכותרת (caption), לא על תיאור התמונה
        const imagePrompt = `Create an original Instagram image inspired by this caption: ${caption}. Keep the style similar to the original post.`;

        const newImageUrl = await generateNewImage(imagePrompt);

        suggestions.push({
          userId,
          content: newCaption,
          imageUrls: newImageUrl ? [newImageUrl] : [post.media_url], // אם יש תמונה חדשה - נשמור אותה, אחרת את המקורית
          source: "instagramProfile",
          refreshed: false,
          createdAt: new Date(),
        });
      }
    }

    // שלב 3: מחיקת הצעות ישנות ושמירה
    await InstagramContentSuggestion.deleteMany({ userId, source: "instagramProfile" });
    const saved = await InstagramContentSuggestion.insertMany(suggestions);

    res.status(200).json(saved);
  } catch (error: any) {
    console.error(
      "Error generating suggestions from popular posts:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
};
