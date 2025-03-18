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

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            res.status(400).json({ message: 'Invalid Google token' });

            return;
        };

        const { sub, email, name } = payload;
        let user = await userModel.findOne({ googleId: sub });

        console.log("reached 3");

        if (!user) {
            user = new userModel({
                username: name,
                email: email,
                googleId: sub,
            });

            await user.save();
        } else {
            console.log("User found:", user);
        }

        if (!process.env.TOKEN_SECRET) {
            res.status(500).json({ message: "Server Error" });

            return;
        };
        
        const jwtToken = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });

        res.status(200).json({
            username: user.username,
            email: user.email,
            _id: user._id,
            token: jwtToken,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in with Google' });
    };
};

const logout = (req: Request, res: Response) => {
    res.status(200).json({ message: "Logged out successfully" });
};

export default { register, login, googleLogin, logout };