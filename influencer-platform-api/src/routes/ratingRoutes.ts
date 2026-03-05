import { Router } from 'express';
import authMiddleware from '@middlewares/authMiddleware';
import {
  submitRating,
  getUserRatings,
  getUserAverageRating,
  submitRatingByCampaingId,
} from '@controllers/ratingController';

const router = Router();

// Submit a rating for an influencer application
router.post('/application/:applicationId', authMiddleware, submitRating);

// Submit a rating for a campaign by campaign ID
router.post('/campaign/:campaignId', authMiddleware, submitRatingByCampaingId);

// Get all ratings for a specific user
router.get('/user/:userId', getUserRatings);

// Get average rating for a user
router.get('/user/:userId/average', getUserAverageRating);

export default router;
