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
    console.log('Starting Instagram auth process with:', { 
      code: code.substring(0, 10) + '...',
      userId,
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI
    });

    // Exchange code for access token using Meta App credentials
    const tokenUrl = 'https://api.instagram.com/oauth/access_token';
    const formData = new URLSearchParams({
      client_id: '665994033060068',  // Your Meta App ID
      client_secret: process.env.META_APP_SECRET!, // Using META_APP_SECRET consistently
      grant_type: 'authorization_code',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
      code: code
    });

    console.log('Making token exchange request with Meta App credentials');

    const tokenResponse = await axios.post<InstagramTokenResponse>(
      tokenUrl,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Token exchange response:', {
      status: tokenResponse.status,
      hasAccessToken: !!tokenResponse.data.access_token,
      hasUserId: !!tokenResponse.data.user_id
    });

    const { access_token, user_id } = tokenResponse.data;

    // Get long-lived access token
    const longLivedTokenUrl = 'https://graph.instagram.com/access_token';
    console.log('Requesting long-lived token from:', longLivedTokenUrl);

    const longLivedTokenResponse = await axios.get<LongLivedTokenResponse>(longLivedTokenUrl, {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: process.env.META_APP_SECRET, // Changed from INSTAGRAM_APP_SECRET to META_APP_SECRET
        access_token
      }
    });

    console.log('Long-lived token response:', {
      status: longLivedTokenResponse.status,
      hasToken: !!longLivedTokenResponse.data.access_token,
      expiresIn: longLivedTokenResponse.data.expires_in
    });

    // Store the tokens
    await User.findByIdAndUpdate(userId, {
      instagramAccessToken: longLivedTokenResponse.data.access_token,
      instagramUserId: user_id
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Instagram auth error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        headers: error.config?.headers
      }
    });

    res.status(500).json({ 
      error: 'Failed to authenticate with Instagram', 
      details: error.response?.data || error.message 
    });
  }
});

export default router;