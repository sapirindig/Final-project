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

      // מייצרים תוכן עם URL של תמונה חיצונית
      const generated = await generateContentFromProfile(profile);

      // מורידים כל תמונה ושומרים ב-uploads, מחליפים את ה-URL ב-URL המקומי
      for (const item of generated) {
        if (item.imageUrls && Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
          try {
            // מורידים את התמונה הראשונה בלבד ומשנים את imageUrls למערך עם ה-URL המקומי
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

    const [newContent] = await generateContentFromProfile(profile, 1);

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
