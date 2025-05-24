import express from "express";
import businessProfileController from "../controllers/business_profile_controller";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: BusinessProfile
 *   description: User business profile management
 */

/**
 * @swagger
 * /business-profile/{userId}:
 *   get:
 *     summary: Get the current user's business profile
 *     tags: [BusinessProfile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: The business profile of the user
 *       401:
 *         description: Unauthorized
 */
router.get("/:userId", authMiddleware, businessProfileController.getProfile);

/**
 * @swagger
 * /business-profile/{userId}:
 *   put:
 *     summary: Update or create the user's business profile
 *     tags: [BusinessProfile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessProfile'
 *     responses:
 *       200:
 *         description: Business profile updated or created successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/:userId", authMiddleware, businessProfileController.updateProfile);

export default router;
