import { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import path from "path";

// Make sure to set these in your .env file
const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || '';

export const postToInstagram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caption } = req.body;
    const imageFile = req.file;

    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
      res.status(500).json({ message: "Instagram credentials not set" });
      return;
    }
    if (!imageFile || !caption) {
      res.status(400).json({ message: "Image and caption required" });
      return;
    }

    // 1. Upload image to Instagram (create media object)
    const imagePath = path.join(process.cwd(), imageFile.path);
    const imageData = fs.readFileSync(imagePath);

    // Instagram requires a publicly accessible URL, so use your uploads endpoint
    const imageUrl = `${PUBLIC_BASE_URL}/uploads/${imageFile.filename}`;

    // Step 1: Create media object
    const mediaRes = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`,
      {
        image_url: imageUrl,
        caption: caption,
        access_token: IG_ACCESS_TOKEN,
      }
    );

    // Tell TypeScript what you expect
    const creationId = (mediaRes.data as { id: string }).id;

    // Step 2: Publish media object
    const publishRes = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`,
      {
        creation_id: creationId,
        access_token: IG_ACCESS_TOKEN,
      }
    );

    // Optionally delete the local file after upload
    fs.unlinkSync(imagePath);

    res.status(200).json({ message: "Posted to Instagram", result: publishRes.data });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Failed to post to Instagram", error: error.message });
  }
};