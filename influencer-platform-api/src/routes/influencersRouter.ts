import getAllInfluencers, {
  getPersonalProfileById,
  updateInfluencerProfile,
  getInfluencerById,
  getInfluencerIncomes,
} from '@controllers/influencersController';
import upload from '@utils/fileUpload';
import { Router } from 'express';
import authMiddleware from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';

const influencersRouter = Router();
influencersRouter.get('/', getAllInfluencers);
influencersRouter.get(
  '/incomes',
  authMiddleware,
  roleMiddleware('influencer'),
  getInfluencerIncomes
);

influencersRouter.put(
  '/profile/:id',
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'portfolioImage', maxCount: 1 },
  ]),
  updateInfluencerProfile
);

influencersRouter.get('/profile/personal/:id', getPersonalProfileById);
influencersRouter.get('/:id', getInfluencerById);

export default influencersRouter;
