import mongoose, { Schema, Document } from "mongoose";

export interface InstagramContentSuggestionDoc extends Document {
  userId: string;
  content: string;
  imageUrls: string[];
  source: string; // לדוגמה: "instagramProfile"
  createdAt: Date;
  refreshed: boolean;
}

const InstagramContentSuggestionSchema = new Schema<InstagramContentSuggestionDoc>({
  userId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  imageUrls: [{ type: String }],
  source: { type: String, default: "instagramProfile" },
  refreshed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const InstagramContentSuggestion = mongoose.model<InstagramContentSuggestionDoc>(
  "InstagramContentSuggestion",
  InstagramContentSuggestionSchema
);

export default InstagramContentSuggestion;
