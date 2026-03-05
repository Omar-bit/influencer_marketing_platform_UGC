import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';

const router = Router();
const recommendationController = new RecommendationController();

router.get('/influencers', recommendationController.getInfluencerRecommendations);
router.get('/influencers/all', recommendationController.getAllIndexedInfluencers);
router.post('/seed', recommendationController.seedTestData);
router.post('/index-all', recommendationController.indexAllInfluencers);

export default router; 