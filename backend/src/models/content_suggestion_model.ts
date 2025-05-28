
import mongoose from "mongoose";

const ContentSuggestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  hashtags: { type: [String], default: [] },
  imageUrls: { type: [String], default: [] },
  contentType: {
    type: String,
    enum: ["Post", "Story", "Reel", "Newsletter"],
    default: "Post",
  },
  refreshed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ContentSuggestion", ContentSuggestionSchema);