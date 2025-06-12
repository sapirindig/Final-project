import express from 'express';
import analyticsController from '../controllers/analytics_controller';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/site-visits', analyticsController.getSiteVisits);
router.post('/google-analytics/callback', authMiddleware, analyticsController.connectGoogleAnalytics);

export default router;