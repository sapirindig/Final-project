import { Request, Response } from 'express';
import { google } from 'googleapis';
import User from '../models/user_model';
import dotenv from 'dotenv';

dotenv.config();

const GA4_PROPERTY_ID = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

let isConfigValid = true;

if (!GA4_PROPERTY_ID) {
    console.error('CRITICAL CONFIG ERROR: GOOGLE_ANALYTICS_PROPERTY_ID (GA4 Property ID) is not set in .env file.');
    isConfigValid = false;
}
if (!GOOGLE_CLIENT_EMAIL) {
    console.error('CRITICAL CONFIG ERROR: GOOGLE_CLIENT_EMAIL (Service Account Email) is not set in .env file.');
    isConfigValid = false;
}
if (!GOOGLE_PRIVATE_KEY) {
    console.error('CRITICAL CONFIG ERROR: GOOGLE_PRIVATE_KEY (Service Account Private Key) is not set in .env file.');
    isConfigValid = false;
}

let auth: any;
let analyticsData: any;

if (isConfigValid) {
    try {
        auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: GOOGLE_CLIENT_EMAIL,
                private_key: GOOGLE_PRIVATE_KEY,
            },
            scopes: ['https://www.googleapis.com/auth/analytics.readonly']
        });

        analyticsData = google.analyticsdata({
            version: 'v1beta',
            auth: auth
        });

        console.log("Google Analytics Data API client initialized successfully.");

    } catch (error: any) {
        console.error("CRITICAL CONFIG ERROR: Failed to initialize Google Auth or Analytics client.", error.message);
        isConfigValid = false;
    }

} else {
    console.error("Google Analytics client NOT initialized due to missing environment variables.");
}

const getSiteVisits = async (req: Request, res: Response): Promise<void> => {
    if (!isConfigValid || !analyticsData) {
        console.error("Error inside getSiteVisits: Analytics client not available due to configuration issues.");
        res.status(500).json({ error: 'Server configuration error preventing Analytics access.' });
        return;
    }

    console.log(`Requesting GA4 'activeUsers' for property: ${GA4_PROPERTY_ID} for date range: yesterday`);

    try {
        const response = await analyticsData.properties.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            requestBody: {
                dateRanges: [{
                    startDate: 'yesterday',
                    endDate: 'yesterday'
                }],
                metrics: [{
                    name: 'activeUsers'
                }]
            }
        });

        const activeUsers = response.data.rows?.[0]?.metricValues?.[0]?.value || '0';

        console.log(`Successfully fetched GA4 data. Active Users (yesterday): ${activeUsers}`);
        res.json({ visitors: activeUsers });

    } catch (error: any) {
        console.error('Error fetching GA4 data:', error.message);
        if (error.response?.data?.error) {
             console.error('Google API Error Details:', JSON.stringify(error.response.data.error, null, 2));
        } else if (error.errors) {
             console.error('Google API Error Details:', JSON.stringify(error.errors, null, 2));
        }

        if (!res.headersSent) {
            res.status(500).json({
                 error: 'Failed to fetch site visits from GA4',
                 details: error.response?.data?.error?.message || error.message || 'Check server logs for details.'
            });
        }
    }
};

interface GoogleAnalyticsTokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

const connectGoogleAnalytics = async (req: Request, res: Response): Promise<void> => {
  const { code, userId } = req.body;

  if (!code || !userId) {
    res.status(400).json({ error: 'Missing code or userId' });
    return;
  }

  try {
    console.log('Starting Google Analytics auth process with:', { 
      code: code.substring(0, 10) + '...',
      userId,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    });

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    console.log('Making token exchange request with Google credentials');

    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('Token exchange response:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      scope: tokens.scope
    });

    // Store tokens in database
    await User.findByIdAndUpdate(userId, {
      googleAnalyticsAccessToken: tokens.access_token,
      googleAnalyticsRefreshToken: tokens.refresh_token,
      googleAnalyticsPropertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID // Use the property ID from env
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Google Analytics auth error:', error);
    res.status(500).json({ 
      error: 'Failed to authenticate with Google Analytics',
      details: error.message 
    });
  }
};

export default { getSiteVisits, connectGoogleAnalytics };