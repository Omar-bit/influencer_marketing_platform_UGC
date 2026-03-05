// filepath: c:\Users\bouas\code\webtrend\influencer-platform\influencer-platform-api\src\routes\aiRoutes.ts
import express from 'express';
import {
  generateAIProposal,
  generateContentSuggestionsForApplication,
} from '../controllers/aiController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/generate-proposal', authMiddleware, generateAIProposal);

router.get(
  '/content-suggestions/:applicationId',
  authMiddleware,
  generateContentSuggestionsForApplication
);

export default router;
