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
    const { caption, scheduledAt } = req.body;
    const imageFile = req.file;

    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
      res.status(500).json({ message: "Instagram credentials not set" });
      return;
    }
    if (!imageFile) {
      res.status(400).json({ message: "Image is required" });
      return;
    }

    const publishPost = async () => {
      try {
        const imagePath = path.join(process.cwd(), imageFile.path);
        const imageUrl = `${PUBLIC_BASE_URL}/uploads/${imageFile.filename}`;

        const mediaRes = await axios.post(
          `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`,
          {
            image_url: imageUrl,
            caption: caption || '',  // אם אין caption שולחים מחרוזת ריקה
            access_token: IG_ACCESS_TOKEN,
          }
        );

        const creationId = (mediaRes.data as { id: string }).id;

        const publishRes = await axios.post(
          `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`,
          {
            creation_id: creationId,
            access_token: IG_ACCESS_TOKEN,
          }
        );

        fs.unlinkSync(imagePath);

        console.log("Posted to Instagram:", publishRes.data);
      } catch (error) {
        if (error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response) {
          // @ts-ignore
          console.error("Error during scheduled posting:", error.response.data);
        } else if (error && typeof error === "object" && "message" in error) {
          // @ts-ignore
          console.error("Error during scheduled posting:", error.message);
        } else {
          console.error("Error during scheduled posting:", error);
        }
      }
    };

    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      const now = new Date();

      if (isNaN(scheduledDate.getTime())) {
        res.status(400).json({ message: "Invalid scheduledAt date" });
        return;
      }
      if (scheduledDate <= now) {
        res.status(400).json({ message: "scheduledAt must be a future date/time" });
        return;
      }

      const delay = scheduledDate.getTime() - now.getTime();

      setTimeout(() => {
        publishPost();
      }, delay);

      res.status(200).json({ message: `Post scheduled for ${scheduledDate.toISOString()}` });
      return;
    }

    await publishPost();

    res.status(200).json({ message: "Posted to Instagram immediately" });

  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Failed to post to Instagram", error: error.message });
  }
};


export const getPopularInstagramPosts = async (req: Request, res: Response): Promise<void> => {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    res.status(500).json({ message: "Instagram credentials not configured" });
    return;
  }

  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  try {
    const url = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count&access_token=${IG_ACCESS_TOKEN}`;

    const response = await axios.get<{ data: Array<any> }>(url);
    const allPosts = response.data.data;

    const now = Date.now();
    const cutoff = now - THIRTY_DAYS_MS;

    const filteredPosts = allPosts
      .filter(p =>
        p.media_type === "IMAGE" &&
        p.timestamp &&
        new Date(p.timestamp).getTime() >= cutoff
      )
      .map(post => ({
        id: post.id,
        caption: post.caption || "",
        media_url: post.media_url,
        timestamp: post.timestamp,
        like_count: post.like_count || 0,
        comments_count: post.comments_count || 0,
        engagement: (post.like_count || 0) + (post.comments_count || 0),
      }))
      .sort((a, b) => b.engagement - a.engagement);

    const topTwo = filteredPosts.slice(0, 2);
    res.status(200).json({ posts: topTwo });

  } catch (error: any) {
    console.error("Error fetching optimized Instagram posts:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
};


export const getMonthlyStats = async (req: Request, res: Response): Promise<void> => {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    res.status(500).json({ message: "Instagram credentials not configured" });
    return;
  }

  try {
    const IG_USER_ID = process.env.IG_USER_ID;
    const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

    const url = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media?fields=id,timestamp,like_count,comments_count,media_type&access_token=${IG_ACCESS_TOKEN}`;
    const response = await axios.get<{ data: Array<any> }>(url);
    const posts = response.data.data;

    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filtered = posts.filter(post => 
      post.media_type === "IMAGE" && 
      new Date(post.timestamp) >= last30
    );

    console.log("📊 פוסטים שנמצאו:", filtered);

    const dailyStats: Record<string, { likes: number; comments: number }> = {};

    for (const post of filtered) {
      const date = post.timestamp.slice(0, 10); // YYYY-MM-DD
      if (!dailyStats[date]) {
        dailyStats[date] = { likes: 0, comments: 0 };
      }
      dailyStats[date].likes += post.like_count || 0;
      dailyStats[date].comments += post.comments_count || 0;
    }

    const statsArray = Object.entries(dailyStats)
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.status(200).json(statsArray);
  } catch (err: any) {
    console.error("Error fetching monthly stats:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
};
