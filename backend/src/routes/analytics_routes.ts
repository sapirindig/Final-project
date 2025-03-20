import express from 'express';
import analyticsController from '../controllers/analytics_controller';

const router = express.Router();

router.get('/site-visits', analyticsController.getSiteVisits);

export default router;