import express from 'express';
import multer from 'multer';
import {
  createCampaign,
  deleteCampaign,
  draftCampaign,
  editCampaign,
  getAllCampaigns,
  getCampaignByBusiness,
  getCampaignById,
  applyToCampaign,
  getCampaignApplications,
  getInfluencerApplications,
  updateApplicationStatus,
  deleteApplication,
  checkApplicationStatus,
  getAllBrandCampaignsApplications,
  getCamapaignPerformance,
  generateThreeDProduct,
  getInfluencerCampaignInvitations,
  respondToCampaignInvitation,
} from '@conrollers/campaignController';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import upload from '@utils/fileUpload';
import { getCookieFromRequest } from '@utils/cookies';
import authMiddleware from '@middlewares/authMiddleware';
const router = express.Router();
// Make sure these specific routes come BEFORE any parameterized routes
router.get('/invitations', authMiddleware, getInfluencerCampaignInvitations);
router.put(
  '/invitation/:invitationId/respond',
  authMiddleware,
  respondToCampaignInvitation
);
router.get(
  '/applications',
  authMiddleware,
  roleMiddleware('business'),
  getAllBrandCampaignsApplications
);
// router.all('/payment/:campaignId', handlePaymentStatus);
// router.post('/:campaignId/payment', authMiddleware, payCampaign);
router.get('/:id/performance', authMiddleware, getCamapaignPerformance);
router.post(
  '/',
  authMiddleware,
  roleMiddleware('business'),
  upload.fields([
    { name: 'image', maxCount: 1 }
  ]),
  createCampaign
);
router.post(
  '/draft',
  authMiddleware,
  roleMiddleware('business'),
  upload.fields([
    { name: 'image', maxCount: 1 }
  ]),
  draftCampaign
);

router.get('/', authMiddleware, getAllCampaigns);

router.get('/:id', authMiddleware, getCampaignById);

router.get('/business/:id', authMiddleware, getCampaignByBusiness);

router.post('/:id/generate-3d', authMiddleware, generateThreeDProduct);

router.put(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'image', maxCount: 1 }
  ]),
  editCampaign
);

router.delete('/:id', authMiddleware, deleteCampaign);

router.post(
  '/:campaignId/apply',
  authMiddleware,
  roleMiddleware('influencer'),
  applyToCampaign
);

router.get(
  '/:campaignId/application-status',
  authMiddleware,
  checkApplicationStatus
);

router.get(
  '/:campaignId/applications',
  authMiddleware,
  roleMiddleware('business'),
  getCampaignApplications
);

router.get(
  '/applications/influencer',
  authMiddleware,
  roleMiddleware('influencer'),
  getInfluencerApplications
);

router.put(
  '/applications/:applicationId/status',
  authMiddleware,
  roleMiddleware('business'),
  updateApplicationStatus
);

// router.put(
//   '/applications/:applicationId/rate',
//authMiddleware,
//   roleMiddleware('business'),
//   rateApplication
// );

router.delete(
  '/applications/:applicationId',
  authMiddleware,
  roleMiddleware('influencer'),
  deleteApplication
);

export default router;
