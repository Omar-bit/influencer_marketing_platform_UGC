import { Router } from 'express';
import {
  getBrandProfile,
  updateBrandProfile,
  deleteBrandAccount,
  getBrandRemainingCampaigns,
} from '../controllers/brandController';
import authMiddleware from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import upload from '@utils/fileUpload';

const router = Router();

router.use(authMiddleware);

router.get(
  '/remainingCampaigns',
  roleMiddleware('business'),
  getBrandRemainingCampaigns
);

router.get('/:id', roleMiddleware('business'), getBrandProfile);

router.put(
  '/:id',
  roleMiddleware('business'),
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'portfolioImage', maxCount: 1 },
  ]),
  updateBrandProfile
);

router.delete('/:id', roleMiddleware('business'), deleteBrandAccount);

export default router;
