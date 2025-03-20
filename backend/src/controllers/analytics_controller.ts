import { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const analytics = google.analytics( {
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
});

const getSiteVisits = async (req: Request, res: Response) => {
  try {
    const response = await analytics.data.ga.get({
      ids: `ga:${process.env.GOOGLE_ANALYTICS_VIEW_ID}`,
      'start-date': '30daysAgo',
      'end-date': 'today',
      metrics: 'ga:pageviews',
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching site visits:', error);
    res.status(500).json({ error: 'Failed to fetch site visits' });
  }
};

export default { getSiteVisits };