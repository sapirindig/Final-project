import InstagramPost from "../models/InstagramPost_model"; // ודאי שזה הנתיב הנכון למודל שלך

/**
 * מחזירה טקסט הכולל את הקפציונים (captions) של הפוסטים עם הכי הרבה מעורבות.
 * המעורבות מחושבת לפי סכום לייקים ותגובות.
 */
export async function getTopInstagramCaptions(userId: string, limit: number = 5): Promise<string> {
  try {
    const topPosts = await InstagramPost.aggregate([
      { $match: { userId } },
      { $addFields: { engagement: { $add: ["$likeCount", "$commentsCount"] } } },
      { $sort: { engagement: -1 } },
      { $limit: limit }
    ]);

    if (topPosts.length === 0) {
      return "";
    }

    const result = topPosts
      .map((post, index) => `#${index + 1}: ${post.caption}`)
      .join("\n\n");

    return result;
  } catch (error) {
    console.error("⚠️ Error fetching top Instagram captions:", error);
    return "";
  }
}

export async function getTopInstagramPosts(userId: string, limit: number = 5) {
  return InstagramPost.find({ userId })
    .sort({ likeCount: -1 })  // מיין לפי הכי הרבה לייקים
    .limit(limit)
    .lean()
    .exec();
}