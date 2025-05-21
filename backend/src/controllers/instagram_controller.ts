import { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import path from "path";

// Ensure these are set in your .env file
const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || '';

/**
 * Fetches the latest Instagram posts (images with captions) for the connected user.
 */
export const getInstagramPosts = async (req: Request, res: Response): Promise<void> => {
  if (!IG_ACCESS_TOKEN) {
    res.status(500).json({ message: "Instagram access token not configured" });
    return;
  }

  try {
    const fields = "id,caption,media_type,media_url,timestamp";
    const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${IG_ACCESS_TOKEN}`;

    const response = await axios.get(url);
    const rawPosts = response.data as any[];

    // Filter only image posts that have captions, limit to 10
    const posts = rawPosts
      .filter(post => post.media_type === "IMAGE" && post.caption)
      .slice(0, 10)
      .map(post => ({
        id: post.id,
        caption: post.caption,
        media_url: post.media_url,
        timestamp: post.timestamp
      }));

    res.status(200).json({ posts });
  } catch (error: any) {
    console.error("Error fetching Instagram posts:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch Instagram posts", error: error.message });
  }
};

/**
 * Uploads an image with caption to Instagram for the connected user.
 */
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

    // 1. Read the uploaded image file
    const imagePath = path.join(process.cwd(), imageFile.path);
    const imageUrl = `${PUBLIC_BASE_URL}/uploads/${imageFile.filename}`;

    // 2. Create media object on Instagram
    const mediaRes = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`,
      {
        image_url: imageUrl,
        caption: caption,
        access_token: IG_ACCESS_TOKEN,
      }
    );

    const creationId = (mediaRes.data as { id: string }).id;

    // 3. Publish the media object
    const publishRes = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`,
      {
        creation_id: creationId,
        access_token: IG_ACCESS_TOKEN,
      }
    );

    // Optionally delete the local file
    fs.unlinkSync(imagePath);

    res.status(200).json({ message: "Posted to Instagram", result: publishRes.data });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Failed to post to Instagram", error: error.message });
  }
};
