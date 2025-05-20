import dotenv from "dotenv";
dotenv.config();
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../models/user_model';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400).json({ message: "Username, email, and password are required" });
        return;
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: "Email already exists" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
        });
        res.status(201).json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
                _id: user._id,
            },
        });
    } catch (err) {
        console.error("Error in register:", err);
        res.status(500).json({ message: "Error registering user" });
    }
};

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        };

        const validPassword = await bcrypt.compare(password, user.password!);
        if (!validPassword) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        };

        if (!process.env.TOKEN_SECRET) {
            res.status(500).json({ message: "Server Error" });
            return;
        };

        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });
        res.status(200).json({
            username: user.username,
            email: user.email,
            _id: user._id,
            token: token,
        });
    } catch (err) {
        res.status(500).json({ message: "Error logging in" });
    }
};

const googleLogin = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
        res.status(500).json({ message: "Google Client ID not configured" });
        return;
    }

    try {
        const client = new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID,
        });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ message: 'Invalid Google token' });
            return;
        }

        const { sub, email, name } = payload;
        // First try to find user by email
        let user = await userModel.findOne({ 
            $or: [
                { googleId: sub },
                { email: email }
            ]
        });

        if (!user) {
            // Create new user if not found
            user = new userModel({
                username: name,
                email: email,
                googleId: sub,
            });
            await user.save();
        } else if (!user.googleId) {
            // Update existing user with googleId if they signed up with email before
            user.googleId = sub;
            await user.save();
        }

        if (!process.env.TOKEN_SECRET) {
            res.status(500).json({ message: "Token secret not configured" });
            return;
        }
        
        const jwtToken = jwt.sign(
            { _id: user._id }, 
            process.env.TOKEN_SECRET, 
            { expiresIn: process.env.TOKEN_EXPIRATION }
        );

        res.status(200).json({
            username: user.username,
            email: user.email,
            _id: user._id,
            token: jwtToken,
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Error logging in with Google' });
    }
};

const logout = (req: Request, res: Response) => {
    res.status(200).json({ message: "Logged out successfully" });
};

export default { register, login, googleLogin, logout };