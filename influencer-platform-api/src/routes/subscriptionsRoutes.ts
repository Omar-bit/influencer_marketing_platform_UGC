import {
  //   cancelSubscription,
  listPlans,
  subscribeToPlan,
  handlePaymentStatus,
  //   upgradeSubscription,
  getMySubscription,
} from '@conrollers/subscriptionController';
import authMiddleware from '@middlewares/authMiddleware';
import { roleMiddleware } from '@middlewares/roleMiddleware';
import { Router } from 'express';

const router = Router();
router.get('/my-subscription', authMiddleware, getMySubscription);
router.get('/plans', listPlans);
router.post(
  '/subscribe',
  authMiddleware,
  roleMiddleware('business'),
  subscribeToPlan
);
router.get('/payment/:subscriptionId', handlePaymentStatus);
// router.post('/cancel', authMiddleware, cancelSubscription);
// router.post('/upgrade', authMiddleware, upgradeSubscription);
export default router;
