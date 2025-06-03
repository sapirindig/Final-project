import { Request, Response, NextFunction } from "express";
import BusinessProfile from "../models/business_profile_model";
import ContentSuggestion from "../models/content_suggestion_model";
import { generateContentFromProfile } from "../services/content_suggestion_service";
import path from "path";
import fs from "fs";
import axios from "axios";

// פונקציה להורדת תמונה ושמירתה בשרת
async function downloadImageToUploads(imageUrl: string): Promise<string> {
  const filename = path.basename(new URL(imageUrl).pathname);
  const filepath = path.join(process.cwd(), "uploads", filename);

  if (fs.existsSync(filepath)) {
    return filename;
  }

  const response = await axios.get(imageUrl, { responseType: "stream" });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filepath);
    (response.data as NodeJS.ReadableStream).pipe(writer);

    writer.on("finish", () => resolve(filename));
    writer.on("error", reject);
  });
}

// פונקציה כללית עם retry ו-backoff
async function callWithBackoff<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.response?.status === 429) {
        if (i < retries) {
          console.warn(`Rate limited, retrying in ${delayMs}ms...`);
          await new Promise(r => setTimeout(r, delayMs));
          delayMs *= 2;
          continue;
        } else {
          console.error("Rate limit exceeded and max retries reached.");
          throw error;
        }
      } else {
        throw error;
      }
    }
  }
  // לא אמור להגיע לכאן, אבל להשלמה
  throw new Error("Failed after retries");
}

export const getOrGenerateSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;

    const existing = await ContentSuggestion.find({ userId }).sort({ createdAt: -1 });

    const isOutdated = existing.some(suggestion => {
      const age = Date.now() - new Date(suggestion.createdAt).getTime();
      return age > 24 * 60 * 60 * 1000;
    });

    if (existing.length < 3 || isOutdated) {
      await ContentSuggestion.deleteMany({ userId });

      const profile = await BusinessProfile.findOne({ userId });
      if (!profile) {
        res.status(404).json({ error: "No business profile found" });
        return;
      }

      // קריאה ל-generateContentFromProfile עטופה ב-retry ו-backoff
      const generated = await callWithBackoff(() => generateContentFromProfile(profile));

      // מורידים תמונות ושומרים ל-uploads
      for (const item of generated) {
        if (item.imageUrls && Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
          try {
            const savedFilename = await downloadImageToUploads(item.imageUrls[0]);
            item.imageUrls = [`http://localhost:3000/uploads/${savedFilename}`];
          } catch (e) {
            console.error("Error downloading image:", e);
          }
        }
      }

      const saved = await ContentSuggestion.insertMany(
        generated.map(item => ({
          ...item,
          userId,
          refreshed: false,
          createdAt: new Date()
        }))
      );

      res.status(200).json(saved);
      return;
    }

    res.status(200).json(existing);
  } catch (err) {
    next(err);
  }
};

export const refreshSingleSuggestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { suggestionId } = req.params;
    const userId = req.params.userId;

    const profile = await BusinessProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ error: "No business profile found" });
      return;
    }

    // קריאה עם retry ליצירת הצעה חדשה
    const [newContent] = await callWithBackoff(() => generateContentFromProfile(profile, 1));

    if (newContent.imageUrls && Array.isArray(newContent.imageUrls) && newContent.imageUrls.length > 0) {
      try {
        const savedFilename = await downloadImageToUploads(newContent.imageUrls[0]);
        newContent.imageUrls = [`http://localhost:3000/uploads/${savedFilename}`];
      } catch (e) {
        console.error("Error downloading image:", e);
      }
    }

    const updated = await ContentSuggestion.findByIdAndUpdate(
      suggestionId,
      {
        ...newContent,
        refreshed: true,
        createdAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

//show contancr from AI according to instagra details:
export const getOrGenerateUserSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;

    console.log(`[getOrGenerateUserSuggestions] Checking suggestions for userId: ${userId}`);

    // מוציא את ההצעות הקיימות, ממוין מהחדש לישן
    const existing = await ContentSuggestion.find({ userId, source: "userProfile" }).sort({ createdAt: -1 });

    console.log(`[getOrGenerateUserSuggestions] Found ${existing.length} existing suggestions`);

    // בדיקה האם ההצעה החדשה ביותר ישנה מ-24 שעות
    let shouldGenerate = false;

    if (existing.length === 0) {
      shouldGenerate = true;
      console.log(`[getOrGenerateUserSuggestions] No existing suggestions, need to generate.`);
    } else {
      const newestSuggestion = existing[0];
      const age = Date.now() - new Date(newestSuggestion.createdAt).getTime();
      if (age > 24 * 60 * 60 * 1000) {
        shouldGenerate = true;
        console.log(`[getOrGenerateUserSuggestions] Existing suggestions are older than 24 hours, need to generate.`);
      }
    }

    if (shouldGenerate) {
      await ContentSuggestion.deleteMany({ userId, source: "userProfile" });

      const profile = await BusinessProfile.findOne({ userId });
      if (!profile) {
        console.log(`[getOrGenerateUserSuggestions] No business profile found for userId ${userId}`);
        res.status(404).json({ error: "No business profile found" });
        return;
      }

      // קריאה עם retry ליצירת תוכן
      const generated = await callWithBackoff(() => generateContentFromProfile(profile));

      // מורידים תמונות ושומרים בשרת
      for (const item of generated) {
  if (item.imageUrls && Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
    try {
      // הורדת התמונה ושמירתה בשרת
      const savedFilename = await downloadImageToUploads(item.imageUrls[0]);

      // החלפת כתובת התמונה לכתובת השרת המקומי (זהה לפונקציה הראשונה)
      item.imageUrls = [`http://localhost:3000/uploads/${savedFilename}`];
    } catch (e) {
      console.error("Error downloading image:", e);
      // אפשר להוסיף פה הגדרת ברירת מחדל לתמונה אם רוצים
      item.imageUrls = [];
    }
  }
}


      const saved = await ContentSuggestion.insertMany(
        generated.map(item => ({
          ...item,
          userId,
          source: "userProfile",
          refreshed: false,
          createdAt: new Date(),
        }))
      );

      console.log(`[getOrGenerateUserSuggestions] Saved ${saved.length} new suggestions`);

      res.status(200).json(saved);
      return;
    }

    // מחזיר את ההצעות הישנות אם הן לא מיושנות
    console.log(`[getOrGenerateUserSuggestions] Returning existing suggestions`);
    res.status(200).json(existing);
  } catch (err) {
    console.error(`[getOrGenerateUserSuggestions] Error:`, err);
    next(err);
  }
};

