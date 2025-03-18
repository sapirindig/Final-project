import { Comment } from "./Comment";
import { Post } from "./Post";

export interface User {
    id: number,
    username: string,
    email: string,
    password: string,
    refreshTokens: string [],
    posts: Post [],
    comments: Comment [],
    createdAt: Date,
    updatedAt: Date,
    profilePicture?: string
};