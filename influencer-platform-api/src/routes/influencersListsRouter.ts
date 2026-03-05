import { Router } from 'express';
import {
  createInfluencersList,
  getInfluencersLists,
  getInfluencersListById,
  updateInfluencersList,
  deleteInfluencersList,
  addMembersToList,
} from '../controllers/influencersListsController';

const router = Router();

router.post('/', createInfluencersList);

router.get('/business/:businessId', getInfluencersLists);

router.get('/:id', getInfluencersListById);

router.put('/:id', updateInfluencersList);

router.delete('/:id', deleteInfluencersList);

router.put('/:id/members', addMembersToList);

export default router;
