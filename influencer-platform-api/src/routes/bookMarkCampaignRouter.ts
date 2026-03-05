import { Router } from 'express';
import authMiddleware from '@middlewares/authMiddleware';
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
  checkBookmark,
} from '@controllers/bookMarkCampaignController';

const router = Router();

router.use(authMiddleware);

router.post('/', addBookmark);

router.delete('/:campaignId', removeBookmark);

router.get('/', getBookmarks);

router.get('/:campaignId', checkBookmark);

export default router;
