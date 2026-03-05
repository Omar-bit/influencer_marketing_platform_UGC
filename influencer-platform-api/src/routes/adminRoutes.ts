import express from 'express';

import {
  getAdminDashboardStats,
  getAdminUsers,
  toggleUserStatus,
  getAdminCampaigns,
  updateCampaignStatus,
  getAdminSubscriptionIncomes,
} from '@controllers/adminController';

const router = express.Router();

// Admin authentication middleware
const adminOnly = (req: any, res: any, next: any) => {
  if (req.user && req.user.type === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Unauthorized access. Admin privileges required.',
    });
  }
};

router.use(adminOnly);

// Dashboard routes
router.get('/dashboard/stats', getAdminDashboardStats);

// User management routes
router.get('/users', getAdminUsers);
router.put('/users/toggle-status/:userId', toggleUserStatus);

// Campaign management routes
router.get('/campaigns', getAdminCampaigns);
router.put('/campaigns/status/:campaignId', updateCampaignStatus);

// Subscription income routes
router.get('/subscription-incomes', getAdminSubscriptionIncomes);

export default router;
