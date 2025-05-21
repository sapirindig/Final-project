import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  refreshTokens: string[];
  posts: Schema.Types.ObjectId[];
  comments: Schema.Types.ObjectId[];
  profilePicture?: string;
  instagramAccessToken?: string;
instagramUserId?: string;

}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true , sparse: true},
  refreshTokens: { type: [String], default: [] },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  profilePicture: { type: String, default: '' },
  instagramAccessToken: { type: String, default: '' },
instagramUserId: { type: String, default: '' },

}, {
  timestamps: true
});

const User = model<IUser>('User', userSchema);
export default User;