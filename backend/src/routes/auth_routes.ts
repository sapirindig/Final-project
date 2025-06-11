import express from "express";
const router = express.Router();
import authController from "../controllers/auth_controller";
import authMiddleware from "../middlewares/authMiddleware"; // Updated path
import axios from "axios";
import { Request, Response } from "express";
import User from "../models/user_model"; // Updated path

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already exists
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", authController.logout);

router.post("/google-login", authController.googleLogin);

interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

interface LongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

router.post("/instagram/callback", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { code, userId } = req.body;

  if (!code || !userId) {
    res.status(400).json({ error: 'Missing code or userId' });
    return;
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post<InstagramTokenResponse>('https://api.instagram.com/oauth/access_token', {
      client_id: process.env.INSTAGRAM_APP_ID,
      client_secret: process.env.INSTAGRAM_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
      code
    });

    const { access_token, user_id } = tokenResponse.data;

    // Get long-lived access token
    const longLivedTokenResponse = await axios.get<LongLivedTokenResponse>('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        access_token
      }
    });

    // Store the tokens in your database
    await User.findByIdAndUpdate(userId, {
      instagramAccessToken: longLivedTokenResponse.data.access_token,
      instagramUserId: user_id
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Instagram auth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Instagram' });
  }
});

export default router;