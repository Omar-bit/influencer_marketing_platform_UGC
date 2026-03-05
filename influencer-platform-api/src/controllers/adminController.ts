import { Request, Response } from 'express';
import User from '@models/user';
import Campaign from '@models/campaign';
import InfluencerApplication from '@models/influencerApplication';
import Ticket from '@models/ticket';
import Subscription from '@models/subscriptions';
import SubscriptionPlan from '@models/subscriptionPlan';
import { Types } from 'mongoose';
import logger from '@utils/logger';
import { createNotification } from './notificationController';

// Dashboard statistics
export async function getAdminDashboardStats(req: Request, res: Response) {
  try {
    // Make sure it's an admin user making the request
    //@ts-ignore
    const userType = req.user?.type;

    if (userType !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin privileges required.',
      });
      return;
    }

    // Get total counts
    const [
      totalInfluencers,
      totalBrands,
      totalCampaigns,
      pendingCampaigns,
      activeCampaigns,
      acceptedApplications,
      pendingApplications,
      totalTickets,
      pendingTickets,
      unreadTickets,
      subscriptions,
    ] = await Promise.all([
      User.countDocuments({ type: 'influencer' }),
      User.countDocuments({ type: 'business' }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: 'review' }),
      Campaign.countDocuments({ status: 'pending' }),
      InfluencerApplication.countDocuments({ status: 'accepted' }),
      InfluencerApplication.countDocuments({ status: 'pending' }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'pending' }),
      Ticket.countDocuments({ read: false }),
      Subscription.find({ status: 'paid' }).populate('planId', 'price'),
    ]);

    // Calculate total subscription income
    const totalSubscriptionIncome = subscriptions.reduce((total, sub) => {
      // @ts-ignore (populated field)
      return total + (sub.planId?.price || 0);
    }, 0);

    // Calculate monthly subscription income (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlySubscriptionIncome = subscriptions
      .filter((sub) => {
        const createdAt = new Date(sub.createdAt);
        return createdAt >= startOfMonth && createdAt <= endOfMonth;
      })
      .reduce((total, sub) => {
        // @ts-ignore (populated field)
        return total + (sub.planId?.price || 0);
      }, 0);

    res.status(200).json({
      success: true,
      message: 'Admin dashboard statistics retrieved successfully',
      data: {
        totalInfluencers,
        totalBrands,
        totalCampaigns,
        pendingCampaigns,
        activeCampaigns,
        totalAcceptedApplications: acceptedApplications,
        totalPendingApplications: pendingApplications,
        totalTickets,
        pendingTickets,
        unreadTickets,
        totalSubscriptionIncome,
        monthlySubscriptionIncome,
      },
    });
  } catch (error: any) {
    logger.error(`Error getting admin dashboard stats: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving dashboard statistics',
    });
  }
}

// Get all users
export async function getAdminUsers(req: Request, res: Response) {
  try {
    // Make sure it's an admin user making the request
    //@ts-ignore
    const userType = req.user?.type;

    if (userType !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin privileges required.',
      });
      return;
    }

    // Get users sorted by creation date (newest first)
    const users = await User.find({})
      .select('name email type status profilePicture createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error: any) {
    logger.error(`Error getting admin users: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving users',
    });
  }
}

// Toggle user status (ban/unban)
export async function toggleUserStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Make sure it's an admin user making the request
    //@ts-ignore
    const adminType = req.user?.type;

    if (adminType !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin privileges required.',
      });
      return;
    }

    // Validate status
    if (status !== 'active' && status !== 'inactive') {
      res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be "active" or "inactive".',
      });
      return;
    }

    // Validate user ID
    if (!Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
      return;
    }

    // Find and update the user
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Prevent admins from being banned
    if (user.type === 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin users cannot be banned',
      });
      return;
    }

    user.status = status;
    await user.save();

    // Send notification to the user about their status change
    try {
      await createNotification(
        userId,
        'Account Status Updated',
        status === 'active'
          ? 'Your account has been activated by an administrator.'
          : 'Your account has been deactivated by an administrator. Please contact support for more information.',
        'system'
      );
    } catch (notificationError) {
      logger.error(
        `Failed to create notification for user status update: ${notificationError}`
      );
    }

    res.status(200).json({
      success: true,
      message: `User ${
        status === 'active' ? 'activated' : 'deactivated'
      } successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error: any) {
    logger.error(`Error toggling user status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating user status',
    });
  }
}

// Get all campaigns for admin
export async function getAdminCampaigns(req: Request, res: Response) {
  try {
    // Make sure it's an admin user making the request
    //@ts-ignore
    const userType = req.user?.type;

    if (userType !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin privileges required.',
      });
      return;
    }

    // Get campaigns sorted by creation date (newest first)
    const campaigns = await Campaign.find({})
      .populate('business', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Campaigns retrieved successfully',
      data: campaigns,
    });
  } catch (error: any) {
    logger.error(`Error getting admin campaigns: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving campaigns',
    });
  }
}

// Update campaign status
export async function updateCampaignStatus(req: Request, res: Response) {
  try {
    const { campaignId } = req.params;
    const { status } = req.body;

    // Make sure it's an admin user making the request
    //@ts-ignore
    const adminType = req.user?.type;

    if (adminType !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin privileges required.',
      });
      return;
    }

    // Validate status
    if (status !== 'unpaid' && status !== 'rejected') {
      res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be "unpaid" or "rejected".',
      });
      return;
    }

    // Validate campaign ID
    if (!Types.ObjectId.isValid(campaignId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid campaign ID format',
      });
      return;
    }

    // Find and update the campaign
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
      return;
    }

    // Update status based on admin decision
    // If rejected, set back to draft for the business to make changes
    campaign.status = status === 'rejected' ? 'draft' : status;
    await campaign.save();

    // Send notification to the business owner
    try {
      await createNotification(
        campaign.business.toString(),
        'Campaign Status Updated',
        status === 'unpaid'
          ? `Your campaign "${campaign.name}" has been approved and is waiting for payment.`
          : `Your campaign "${campaign.name}" has been rejected. Please review and make necessary changes before resubmitting.`,
        'campaign'
      );
    } catch (notificationError) {
      logger.error(
        `Failed to create notification for campaign status update: ${notificationError}`
      );
    }

    res.status(200).json({
      success: true,
      message: `Campaign ${
        status === 'pending' ? 'approved' : 'rejected'
      } successfully`,
      data: {
        _id: campaign._id,
        name: campaign.name,
        status: campaign.status,
      },
    });
  } catch (error: any) {
    logger.error(`Error updating campaign status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating campaign status',
    });
  }
}

// Get all subscription incomes for admin
export async function getAdminSubscriptionIncomes(req: Request, res: Response) {
  try {
    // Make sure it's an admin user making the request
    //@ts-ignore
    const userType = req.user?.type;

    if (userType !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin privileges required.',
      });
      return;
    }

    // Get all paid subscriptions with user and plan details
    const subscriptions = await Subscription.find({ status: 'paid' })
      .populate('userId', 'name email')
      .populate('planId', 'name price offeredCampaigns')
      .sort({ createdAt: -1 });

    // Calculate total income
    const totalIncome = subscriptions.reduce((total, sub) => {
      // @ts-ignore (populated field)
      const planPrice = sub.planId?.price || 0;
      return total + planPrice;
    }, 0);

    // Calculate monthly incomes (last 6 months)
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5); // 6 months including current month

    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);

      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthlySubscriptions = subscriptions.filter((sub) => {
        const createdAt = new Date(sub.createdAt);
        return createdAt >= startOfMonth && createdAt <= endOfMonth;
      });

      const monthlyIncome = monthlySubscriptions.reduce((total, sub) => {
        // @ts-ignore (populated field)
        const planPrice = sub.planId?.price || 0;
        return total + planPrice;
      }, 0);

      monthlyData.push({
        month: month.toLocaleString('default', { month: 'long' }),
        year: month.getFullYear(),
        income: monthlyIncome,
        subscriptions: monthlySubscriptions.length,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription incomes retrieved successfully',
      data: {
        subscriptions,
        totalIncome,
        monthlyData,
      },
    });
  } catch (error: any) {
    logger.error(`Error getting subscription incomes: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving subscription incomes',
    });
  }
}
