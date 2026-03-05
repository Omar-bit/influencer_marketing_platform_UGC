import { Router } from 'express';
import authRouter from './authRouter';
import userRouter from './userRouter';
import campaignRouter from './campaignRouter';
import influencersRouter from './influencersRouter';
import influencersLists from './influencersListsRouter';
import chatRouter from './chatRoutes';
import notificationRouter from './notificationRouter';
import aiRouter from './aiRoutes';
import contentRouter from './campaignContentRoutes';
import campaignContentRouter from './campaignContentRoutes'; // New import for campaign content
import adminRouter from './adminRoutes'; // Import admin routes
import ticketRouter from './ticketRouter'; // Import ticket routes
import authMiddleware from '@middlewares/authMiddleware';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_SECRET,
  YOUTUBE_API_KEY,
  YOUTUBE_OAUTH_TOKEN,
} from '@utils/secrets';
import User from '@models/user';
import { google } from 'googleapis';
import axios from 'axios';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import bookMarkRouter from './bookMarkCampaignRouter';
import subscriptionRouter from './subscriptionsRoutes';
import brandRouter from './brandRouter';
import ratingRouter from './ratingRoutes';
import path from 'path';
import express from 'express';
import recommendationRouter from './recommendation.routes';
import productRouter from './productRoutes';

const router = Router();
router.use('/auth', authRouter);
router.use('/campaign', campaignRouter);
router.use('/influencers-list', authMiddleware, influencersLists);
router.use(
  '/influencers',
  authMiddleware,
  // roleMiddleware('business'),
  influencersRouter,
);
router.use('/content', authMiddleware, contentRouter);
router.use('/campaign-content', campaignContentRouter);
router.use('/user', userRouter);
router.use('/bookmarks', authMiddleware, bookMarkRouter);
router.use('/chat', chatRouter);
router.use('/notifications', notificationRouter);
router.use('/brand', authMiddleware, brandRouter);
router.use('/ai', aiRouter);
router.use('/admin', authMiddleware, adminRouter);
router.use('/rating', authMiddleware, ratingRouter);
router.use('/subscriptions', subscriptionRouter);
router.use('/tickets', ticketRouter);
router.use('/recommendations', authMiddleware, recommendationRouter);
router.use('/products', productRouter);
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

router.get('/youtube/channel', async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&mine=true&key=${YOUTUBE_API_KEY}`,
      {
        headers: {
          Authorization: `Bearer ${YOUTUBE_OAUTH_TOKEN}`,
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching YouTube channel');
  }
});
export default router;
