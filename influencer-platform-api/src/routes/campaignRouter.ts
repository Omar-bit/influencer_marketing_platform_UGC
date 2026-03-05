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
  getCampaignPerformanceStats,
  closeCampaign,
  getBrandDashboardStats,
} from '@conrollers/campaignController';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import upload from '@utils/fileUpload';
import { getCookieFromRequest } from '@utils/cookies';
import authMiddleware from '@middlewares/authMiddleware';
const router = express.Router();
router.get(
  '/invitations',
  authMiddleware,
  roleMiddleware('influencer'),
  getInfluencerCampaignInvitations
);
router.put(
  '/invitation/:invitationId/respond',
  authMiddleware,
  roleMiddleware('influencer'),
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
router.post(
  '/',
  authMiddleware,
  roleMiddleware('business'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'productFiles', maxCount: 10 },
  ]),
  createCampaign
);
router.post(
  '/draft',
  authMiddleware,
  roleMiddleware('business'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'productFiles', maxCount: 10 },
  ]),
  draftCampaign
);

router.get('/', authMiddleware, getAllCampaigns);

// Get brand dashboard stats - this needs to come before the /:id route
router.get(
  '/brand-dashboard-stats',
  authMiddleware,
  roleMiddleware('business'),
  getBrandDashboardStats
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

router.delete(
  '/applications/:applicationId',
  authMiddleware,
  roleMiddleware('influencer'),
  deleteApplication
);

// Get campaign performance stats
router.get(
  '/performance-stats',
  authMiddleware,
  roleMiddleware('business'),
  getCampaignPerformanceStats
);

router.get('/business/:id', authMiddleware, getCampaignByBusiness);

router.get('/:id', authMiddleware, getCampaignById);
router.post('/:id/generate-3d', authMiddleware, generateThreeDProduct);
router.get('/:id/performance', authMiddleware, getCamapaignPerformance);

router.put(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'productFiles', maxCount: 10 },
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

// router.put(
//   '/applications/:applicationId/rate',
//authMiddleware,
//   roleMiddleware('business'),
//   rateApplication
// );

// Close campaign
router.put(
  '/:id/close',
  authMiddleware,
  roleMiddleware('business'),
  closeCampaign
);

export default router;
