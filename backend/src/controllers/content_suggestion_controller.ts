import { Request, Response, NextFunction } from "express";
import BusinessProfile from "../models/business_profile_model"; // וודא שהנתיב למודל זה נכון
import ContentSuggestion from "../models/content_suggestion_model"; // וודא שהנתיב למודל זה נכון
import InstagramContentSuggestion from "../models/InstagramContentSuggestion";
import { generateContentFromProfile, fetchAndStoreInstagramPosts } from "../services/content_suggestion_service"; // וודא שהנתיב נכון
import path from "path";
import fs from "fs";
import axios from "axios";
import mongoose from "mongoose";

// פונקציית עזר: הורדת תמונה ושמירתה בשרת
async function downloadImageToUploads(imageUrl: string): Promise<string> {
    const filename = path.basename(new URL(imageUrl).pathname);
    const filepath = path.join(process.cwd(), "uploads", filename);

    if (fs.existsSync(filepath)) {
        console.log(`[downloadImageToUploads] Image already exists: ${filename}`);
        return filename;
    }

    try {
        const response = await axios.get(imageUrl, { responseType: "stream" });
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filepath);
            (response.data as NodeJS.ReadableStream).pipe(writer);
            writer.on("finish", () => {
                console.log(`[downloadImageToUploads] Image downloaded and saved: ${filename}`);
                resolve(filename);
            });
            writer.on("error", (err) => {
                console.error(`[downloadImageToUploads] Error writing image file ${filename}:`, err);
                reject(err);
            });
        });
    } catch (error) {
        console.error(`[downloadImageToUploads] Failed to download image from ${imageUrl}:`, error);
        throw error;
    }
}

// פונקציית עזר: retry עם backoff
async function callWithBackoff<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            if (error.response?.status === 429 && i < retries) {
                console.warn(`[callWithBackoff] Rate limited, retrying in ${delayMs}ms...`);
                await new Promise(r => setTimeout(r, delayMs));
                delayMs *= 2;
                continue;
            } else {
                console.error(`[callWithBackoff] Error on retry attempt ${i + 1}/${retries + 1}:`, error.message);
                throw error;
            }
        }
    }
    throw new Error("[callWithBackoff] Failed after retries");
}

/**
 * פונקציה 1: יצירת הצעות תוכן על פי BusinessProfile (userId הוא ObjectId)
 */
export const getOrGenerateSuggestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("[getOrGenerateSuggestions] Request received.");
    try {
        const userIdStr = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(userIdStr)) {
            console.warn("[getOrGenerateSuggestions] Invalid User ID format:", userIdStr);
            res.status(400).json({ error: "Invalid User ID format" });
            return;
        }
        const userId = new mongoose.Types.ObjectId(userIdStr);

        const existing = await ContentSuggestion.find({ userId }).sort({ createdAt: -1 });
        const isOutdated = existing.some(s => Date.now() - new Date(s.createdAt).getTime() > 24 * 60 * 60 * 1000);

        if (existing.length < 3 || isOutdated) {
            console.log("[getOrGenerateSuggestions] Generating new general suggestions: less than 3 or outdated.");
            await ContentSuggestion.deleteMany({ userId });
            console.log(`[getOrGenerateSuggestions] Deleted old general content suggestions for userId: ${userIdStr}`);

            const profile = await BusinessProfile.findOne({ userId });
            if (!profile) {
                console.error("[getOrGenerateSuggestions] No business profile found for userId:", userIdStr);
                res.status(404).json({ error: "No business profile found" });
                return;
            }

            // קריאה ל-AI עם פרופיל בלבד (ללא userId ו-accessToken)
            const generated = await callWithBackoff(() => generateContentFromProfile(profile, undefined, undefined, 3));
            console.log(`[getOrGenerateSuggestions] AI generated ${generated.length} general suggestions.`);

            for (const item of generated) {
                if (item.imageUrls?.length) {
                    try {
                        const filename = await downloadImageToUploads(item.imageUrls[0]);
                        item.imageUrls = [`http://localhost:3000/uploads/${filename}`];
                    } catch (e) {
                        console.error("[getOrGenerateSuggestions] Error downloading image for general suggestion:", e);
                        // במקרה של כשל, תשאיר ריק או ברירת מחדל
                        item.imageUrls = [];
                    }
                }
            }

            console.log(`[getOrGenerateSuggestions] Attempting to save ${generated.length} new general suggestions.`);
            const saved = await ContentSuggestion.insertMany(
                generated.map(item => ({ ...item, userId, refreshed: false, createdAt: new Date() }))
            );
            console.log(`[getOrGenerateSuggestions] Successfully saved ${saved.length} new general suggestions.`);

            res.status(200).json(saved);
            return;
        }

        console.log(`[getOrGenerateSuggestions] Returning ${existing.length} existing general suggestions.`);
        res.status(200).json(existing);
    } catch (err) {
        console.error("[getOrGenerateSuggestions] Unhandled error:", err);
        next(err);
    }
};

/**
 * פונקציה 2: ריענון הצעה ספציפית לפי BusinessProfile (userId ObjectId)
 */
export const refreshSingleSuggestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("[refreshSingleSuggestion] Request received.");
    try {
        const { suggestionId } = req.params;
        const userIdStr = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userIdStr)) {
            console.warn("[refreshSingleSuggestion] Invalid User ID format:", userIdStr);
            res.status(400).json({ error: "Invalid User ID format" });
            return;
        }
        const userId = new mongoose.Types.ObjectId(userIdStr);

        const profile = await BusinessProfile.findOne({ userId });
        if (!profile) {
            console.error("[refreshSingleSuggestion] No business profile found for userId:", userIdStr);
            res.status(404).json({ error: "No business profile found" });
            return;
        }

        // יוצרים הצעה חדשה אחת
        const [newContent] = await callWithBackoff(() => generateContentFromProfile(profile, undefined, undefined, 1));
        console.log("[refreshSingleSuggestion] AI generated 1 new suggestion for refresh.");

        if (newContent.imageUrls?.length) {
            try {
                const filename = await downloadImageToUploads(newContent.imageUrls[0]);
                newContent.imageUrls = [`http://localhost:3000/uploads/${filename}`];
            } catch (e) {
                console.error("[refreshSingleSuggestion] Error downloading image for single suggestion refresh:", e);
                newContent.imageUrls = [];
            }
        }

        console.log(`[refreshSingleSuggestion] Attempting to update suggestionId: ${suggestionId}`);
        const updated = await ContentSuggestion.findByIdAndUpdate(
            suggestionId,
            { ...newContent, refreshed: true, createdAt: new Date() },
            { new: true }
        );

        if (!updated) {
            console.warn(`[refreshSingleSuggestion] Suggestion with ID ${suggestionId} not found for update.`);
            res.status(404).json({ error: "Suggestion not found" });
            return;
        }

        console.log(`[refreshSingleSuggestion] Successfully updated suggestionId: ${suggestionId}`);
        res.status(200).json(updated);
    } catch (err) {
        console.error("[refreshSingleSuggestion] Unhandled error:", err);
        next(err);
    }
};

