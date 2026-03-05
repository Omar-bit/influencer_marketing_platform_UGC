import express from 'express';
import {
  submitCampaignContent,
  getCampaignContents,
  getCampaignContent,
  updateContentStatus,
  getAllCampaignContents,
  payContent,
  handlePaymentStatus,
} from '../controllers/campaignContentController';
import upload from '@utils/fileUpload';
import authMiddleware from '@middlewares/authMiddleware';

const router = express.Router();

router.all('/payment/:contentId', handlePaymentStatus);
router.post('/:contentId/payment', authMiddleware, payContent);
router.post(
  '/:campaignId',
  authMiddleware,
  upload.array('contentAssets', 10),
  submitCampaignContent
);

router.get('/campaign/:campaignId', authMiddleware, getCampaignContents);

router.get('/all', authMiddleware, getAllCampaignContents);

router.get('/:contentId', authMiddleware, getCampaignContent);

router.put('/status/:contentId', authMiddleware, updateContentStatus);

export default router;
