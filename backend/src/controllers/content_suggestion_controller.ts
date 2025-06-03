import { Request, Response, NextFunction } from "express";
import BusinessProfile from "../models/business_profile_model";
import ContentSuggestion from "../models/content_suggestion_model"; // assuming this is ObjectId
import InstagramContentSuggestion from "../models/InstagramContentSuggestion"; // assuming this is String
import { generateContentFromProfile } from "../services/content_suggestion_service";
import path from "path";
import fs from "fs";
import axios from "axios";
import mongoose from "mongoose"; // <--- !!! חובה להוסיף את זה !!!

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
  throw new Error("Failed after retries");
}

// *** פונקציית getOrGenerateSuggestions (לשם BusinessProfile או ContentSuggestion אם משתמש ב-ObjectId) ***
export const getOrGenerateSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userIdFromParams = req.params.userId; // זה ה-userId מגיע כסטרינג

    // ודא שה-userId הוא ObjectId חוקי לפני ההמרה (לצורך BusinessProfile ו-ContentSuggestion)
    if (!mongoose.Types.ObjectId.isValid(userIdFromParams)) {
        console.log(`[getOrGenerateSuggestions] Invalid userId format: ${userIdFromParams}`);
        res.status(400).json({ error: "Invalid User ID format" });
        return;
    }
    const userIdAsObjectId = new mongoose.Types.ObjectId(userIdFromParams); // ממיר ל-ObjectId

    // נניח ש-ContentSuggestion.userId הוא ObjectId
    const existing = await ContentSuggestion.find({ userId: userIdAsObjectId }).sort({ createdAt: -1 });

    const isOutdated = existing.some(suggestion => {
      const age = Date.now() - new Date(suggestion.createdAt).getTime();
      return age > 24 * 60 * 60 * 1000;
    });

    if (existing.length < 3 || isOutdated) {
      await ContentSuggestion.deleteMany({ userId: userIdAsObjectId }); // השתמש ב-ObjectId

      const profile = await BusinessProfile.findOne({ userId: userIdAsObjectId }); // השתמש ב-ObjectId
      if (!profile) {
        res.status(404).json({ error: "No business profile found" });
        return;
      }

      const generated = await callWithBackoff(() => generateContentFromProfile(profile));

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
          userId: userIdAsObjectId, // שמור כ-ObjectId
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

// *** פונקציית refreshSingleSuggestion (לשם BusinessProfile או ContentSuggestion אם משתמש ב-ObjectId) ***
export const refreshSingleSuggestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { suggestionId } = req.params;
    const userIdFromParams = req.params.userId; // זה ה-userId מגיע כסטרינג

    if (!mongoose.Types.ObjectId.isValid(userIdFromParams)) {
        console.log(`[refreshSingleSuggestion] Invalid userId format: ${userIdFromParams}`);
        res.status(400).json({ error: "Invalid User ID format" });
        return;
    }
    const userIdAsObjectId = new mongoose.Types.ObjectId(userIdFromParams); // ממיר ל-ObjectId

    const profile = await BusinessProfile.findOne({ userId: userIdAsObjectId }); // השתמש ב-ObjectId
    if (!profile) {
      res.status(404).json({ error: "No business profile found" });
      return;
    }

    const [newContent] = await callWithBackoff(() => generateContentFromProfile(profile, 1));

    if (newContent.imageUrls && Array.isArray(newContent.imageUrls) && newContent.imageUrls.length > 0) {
      try {
        const savedFilename = await downloadImageToUploads(newContent.imageUrls[0]);
        newContent.imageUrls = [`http://localhost:3000/uploads/${savedFilename}`];
      } catch (e) {
        console.error("Error downloading image:", e);
      }
    }

    // נניח ש-ContentSuggestion.userId הוא ObjectId
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

// *** פונקציית getOrGenerateUserSuggestions (שלה `userId` ב-InstagramContentSuggestion הוא String) ***
export const getOrGenerateUserSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userIdFromParams = req.params.userId; // ה-userId כסטרינג מגיע מה-URL

    console.log(`[getOrGenerateUserSuggestions] Checking suggestions for userId: ${userIdFromParams}`);

    // השאילתה ל-InstagramContentSuggestion: userId הוא String, לכן משתמשים ב-userIdFromParams ישירות
    const existing = await InstagramContentSuggestion.find({ userId: userIdFromParams, source: "userProfile" }).sort({ createdAt: -1 });

    console.log(`[getOrGenerateUserSuggestions] Found ${existing.length} existing suggestions`);

    let shouldGenerate = false;

    if (existing.length === 0) {
      shouldGenerate = true;
      console.log(`[getOrGenerateUserSuggestions] No existing suggestions, need to generate.`);
    } else {
      const newestSuggestion = existing[0];
      const age = Date.now() - new Date(newestSuggestion.createdAt).getTime();
      // בודק אם ההצעות הקיימות ישנות מ-24 שעות
      if (age > 24 * 60 * 60 * 1000) {
        shouldGenerate = true;
        console.log(`[getOrGenerateUserSuggestions] Existing suggestions are older than 24 hours, need to generate.`);
      }
    }

    if (shouldGenerate) {
      // מחיקה ב-InstagramContentSuggestion - השתמש ב-userIdFromParams (String)
      await InstagramContentSuggestion.deleteMany({ userId: userIdFromParams, source: "userProfile" });
      console.log(`[getOrGenerateUserSuggestions] Deleted existing suggestions for userId: ${userIdFromParams}`);


      // **כאן נדרשת המרה ל-ObjectId עבור BusinessProfile, כי ה-userId שלו הוא ObjectId**
      if (!mongoose.Types.ObjectId.isValid(userIdFromParams)) {
          console.log(`[getOrGenerateUserSuggestions] Invalid userId format for BusinessProfile: ${userIdFromParams}`);
          res.status(400).json({ error: "Invalid User ID format for Business Profile" });
          return;
      }
      const userIdAsObjectIdForBusinessProfile = new mongoose.Types.ObjectId(userIdFromParams);

      // חיפוש פרופיל עסקי - השתמש ב-userIdAsObjectIdForBusinessProfile (ObjectId)
      const profile = await BusinessProfile.findOne({ userId: userIdAsObjectIdForBusinessProfile });
      if (!profile) {
        console.log(`[getOrGenerateUserSuggestions] No business profile found for userId ${userIdFromParams}`);
        res.status(404).json({ error: "No business profile found" });
        return;
      }

      // ייצור תוכן חדש מה-AI
      let generated = await callWithBackoff(() => generateContentFromProfile(profile));

      // **שינוי כאן: הגבלת התוכן המיוצר ל-3 פוסטים בלבד**
      generated = generated.slice(0, 3);
      console.log(`[getOrGenerateUserSuggestions] Generated ${generated.length} new suggestions (capped at 3).`);


      for (const item of generated) {
        if (item.imageUrls && Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
          try {
            const savedFilename = await downloadImageToUploads(item.imageUrls[0]);
            item.imageUrls = [`http://localhost:3000/uploads/${savedFilename}`];
            console.log(`[getOrGenerateUserSuggestions] Downloaded image for suggestion: ${savedFilename}`);
          } catch (e) {
            console.error("Error downloading image:", e);
            item.imageUrls = []; // הגדר ברירת מחדל אם נכשלה הורדה
          }
        }
      }

      // שמירה ב-InstagramContentSuggestion - השתמש ב-userIdFromParams (String)
      const saved = await InstagramContentSuggestion.insertMany(
        generated.map(item => ({
          ...item,
          userId: userIdFromParams, // שמירה כ-String
          source: "userProfile", // ודא שזה userProfile אם זו המטרה
          refreshed: false,
          createdAt: new Date(),
        }))
      );

      console.log(`[getOrGenerateUserSuggestions] Saved ${saved.length} new suggestions`);

      res.status(200).json(saved);
      return;
    }

    console.log(`[getOrGenerateUserSuggestions] Returning existing suggestions`);
    res.status(200).json(existing);
  } catch (err) {
    console.error(`[getOrGenerateUserSuggestions] Error:`, err);
    next(err);
  }
};