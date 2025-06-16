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

