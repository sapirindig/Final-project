import mongoose, { Schema, Document } from "mongoose";

export interface IBusinessProfile extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  businessType: string;
  platforms: string[]; // "Instagram", "Website"
  contentTypes: string[]; // "Posts", "Stories", "Reels", "Newsletter"
  marketingGoals: string[];
  audienceType: string; // text field up to 1 sentence
  toneOfVoice: string; // "Friendly", "Professional", etc.
  postLength: "short" | "medium" | "long";
  mainColors: string[]; // up to 5 hex colors
  emojisAllowed: boolean;
  favoriteEmojis: string[]; // up to 7 emojis
  hashtagsStyle: "none" | "fewRelevant" | "manyForReach";
  keywords: string; // free text
  customHashtags: string; // free text
}

const BusinessProfileSchema: Schema<IBusinessProfile> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  platforms: {
    type: [String],
    enum: ["Instagram", "Website"],
    default: [],
  },
  contentTypes: {
    type: [String],
    enum: ["Posts", "Stories", "Reels", "Newsletter"],
    default: [],
  },
  marketingGoals: { type: [String], default: [] },
  audienceType: { type: String, default: "" },
  toneOfVoice: {
    type: String,
    enum: [
      "Friendly",
      "Professional",
      "Funny",
      "Luxury",
      "Inspirational",
      "Bold",
      "Minimalistic",
      "Emotional",
    ],
    default: "Friendly",
  },
  postLength: {
    type: String,
    enum: ["short", "medium", "long"],
    default: "medium",
  },
  mainColors: {
    type: [String],
    validate: {
      validator: (arr: string[]) => arr.length <= 5,
      message: "Maximum 5 colors allowed",
    },
    default: [],
  },
  emojisAllowed: { type: Boolean, default: true },
  favoriteEmojis: {
    type: [String],
    validate: {
      validator: (arr: string[]) => arr.length <= 7,
      message: "Maximum 7 emojis allowed",
    },
    default: [],
  },
  hashtagsStyle: {
    type: String,
    enum: ["none", "fewRelevant", "manyForReach"],
    default: "fewRelevant",
  },
  keywords: { type: String, default: "" },
  customHashtags: { type: String, default: "" },
});


const BusinessProfile = mongoose.model<IBusinessProfile>(
  "BusinessProfile",
  BusinessProfileSchema
);

export default BusinessProfile;
