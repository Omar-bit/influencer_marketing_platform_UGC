import { Request, Response } from 'express';
import SubscriptionPlan, {
  ISubscriptionPlan,
} from '../models/subscriptionPlan';
import User from '../models/user';
import { getPaymentStatus, initiatePayment } from '../services/paymentService';
import mongoose from 'mongoose';
import logger from '@utils/logger';
import Subscription from '@models/subscriptions';
import { SUBSCRIPTION_REDIRECTION, SUBSCRIPTION_URL } from '@utils/constants';

// List all available subscription plans
export async function listPlans(req: Request, res: Response) {
  try {
    const plans = await SubscriptionPlan.find();
    if (!plans || plans.length === 0) {
      res.json({ success: false, message: 'No plans found', data: null });
      return;
    }
    res.json({ success: true, message: 'Plans retrieved', data: plans });
  } catch (err: any) {
    res.json({ success: false, message: err.message, data: null });
  }
}

// Subscribe, upgrade, or downgrade a plan
export async function subscribeToPlan(req: Request, res: Response) {
  try {
    //@ts-ignore
    const userId = req.user?.userId;

    const { planId } = req.body;
    if (!userId || !planId) {
      res.json({
        success: false,
        message: 'User ID and plan ID are required',
        data: null,
      });
      return;
    }
    const user = await User.findById(userId);
    if (!user || user.type !== 'business') {
      res.json({
        success: false,
        message: 'Business user not found',
        data: null,
      });
      return;
    }
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      res.json({ success: false, message: 'Plan not found', data: null });
      return;
    }
    const subscription = new Subscription({
      userId: userId,
      planId: planId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      remainingCampaigns: plan.offeredCampaigns,
    });
    const payment = await initiatePayment(
      plan.price,
      user.email,
      SUBSCRIPTION_URL + subscription._id,
      SUBSCRIPTION_URL + subscription._id,
      `Subscription to ${plan.name}`
    );

    if (!payment || !payment.paymentRef) {
      res.json({
        success: false,
        message: 'Payment initiation failed',
        data: null,
      });
      return;
    }
    subscription.paymentRef = payment.paymentRef;
    await subscription.save();
    res.json({
      success: true,
      message: 'Payment required',
      data: { paymentUrl: payment.payUrl },
    });
  } catch (err: any) {
    logger.error('Error in subscribeToPlan:', err);
    console.log('Error in subscribeToPlan:', err.message);
    res.json({ success: false, message: err.message, data: null });
  }
}
export async function handlePaymentStatus(req: Request, res: Response) {
  // /api/subscriptions/payment/6818f9dff31dc82002d67347?payment_ref=681c2a9683a36f0786e9e1f3
  const { payment_ref } = req.query;
  const { subscriptionId } = req.params;
  if (!payment_ref) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
    return;
  }
  try {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      res
        .status(404)
        .json({ success: false, message: 'Subscription not found' });
      return;
    }
    const plan = await SubscriptionPlan.findById(subscription.planId);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }
    const user = await User.findById(subscription.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const paymentStatus = await getPaymentStatus(payment_ref as string);

    if (!paymentStatus) {
      res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (paymentStatus.payment.status !== 'completed') {
      res
        .status(400)
        .json({ success: false, message: 'Payment not completed' });
      return;
    }

    subscription.status = 'paid';

    await subscription.save();
    user.activeSubscription = subscription._id.toString();

    await user.save();

    logger.info(`Payment successful for subscription: ${subscriptionId}`);

    const redirectionParams = new URLSearchParams({
      type: 'Subscription',
      paymentRef: payment_ref as string,
      subscriptionId: subscriptionId,
      status: 'success',
    });
    res
      .status(200)
      .redirect(SUBSCRIPTION_REDIRECTION + '?' + redirectionParams.toString());
  } catch (err: any) {
    const redirectionParams = new URLSearchParams({
      type: 'Subscription',
      paymentRef: payment_ref as string,
      status: 'failed',
      subscriptionId: subscriptionId,
      error: err.message,
    });
    logger.error(err.message);
    res.redirect(SUBSCRIPTION_REDIRECTION + '?' + redirectionParams.toString());
  }
}
//getMySubscription
export async function getMySubscription(req: Request, res: Response) {
  try {
    //@ts-ignore
    const userId = req.user?.userId;
    if (!userId) {
      res.json({ success: false, message: 'User ID is required', data: null });
      return;
    }
    const user = await User.findById(userId);
    if (!user || user.type !== 'business') {
      res.json({
        success: false,
        message: 'Business user not found',
        data: null,
      });
      return;
    }
    let subscription = await Subscription.findOne({
      _id: user.activeSubscription,
      userId: userId,

      endDate: { $gt: new Date() },

      status: 'paid',
      startDate: { $lte: new Date() },
    });

    if (!subscription) {
      res.json({
        success: true,
        message: 'No active subscription found',
        data: {
          plan: {
            name: 'Free',
            price: 0,
            offeredCampaigns: 2,
          },
        },
      });
      return;
    }
    const plan = await SubscriptionPlan.findById(subscription.planId);
    if (!plan) {
      res.json({ success: false, message: 'Plan not found', data: null });
      return;
    }
    res.json({
      success: true,
      message: 'Subscription retrieved',
      data: { subscription, plan },
    });
  } catch (err: any) {
    res.json({ success: false, message: err.message, data: null });
  }
}
// Cancel subscription for a business user
// export async function cancelSubscription(req: Request, res: Response) {
//   try {
//     //@ts-ignore
//     const userId = req.user?.userId || req.body.userId;
//     if (!userId) {
//       res.json({ success: false, message: 'User ID is required', data: null });
//       return;
//     }
//     const user = await User.findById(userId);
//     if (!user || user.type !== 'business') {
//       res.json({
//         success: false,
//         message: 'Business user not found',
//         data: null,
//       });
//       return;
//     }
//     user.subscriptionPlan = undefined;
//     user.subscriptionStart = undefined;
//     user.subscriptionEnd = new Date();
//     user.campaignsThisMonth = 0;
//     await user.save();
//     res.json({
//       success: true,
//       message: 'Subscription cancelled successfully',
//       data: null,
//     });
//   } catch (err: any) {
//     res.json({ success: false, message: err.message, data: null });
//   }
// }

// // Upgrade subscription plan for a business user
// export async function upgradeSubscription(req: Request, res: Response) {
//   try {
//     //@ts-ignore
//     const userId = req.user?.userId || req.body.userId;
//     const { planId } = req.body;
//     if (!userId || !planId) {
//       res.json({
//         success: false,
//         message: 'User ID and plan ID are required',
//         data: null,
//       });
//       return;
//     }
//     const user = await User.findById(userId).populate('subscriptionPlan');
//     if (!user || user.type !== 'business') {
//       res.json({
//         success: false,
//         message: 'Business user not found',
//         data: null,
//       });
//       return;
//     }
//     const currentPlan = user.subscriptionPlan as ISubscriptionPlan | undefined;
//     const newPlan = await SubscriptionPlan.findById(planId);
//     if (!newPlan) {
//       res.json({ success: false, message: 'Plan not found', data: null });
//       return;
//     }
//     //@ts-ignore
//     if (currentPlan && currentPlan._id.toString() === newPlan._id.toString()) {
//       res.json({
//         success: false,
//         message: 'You are already on this plan',
//         data: null,
//       });
//       return;
//     }
//     if (
//       currentPlan &&
//       newPlan.campaignLimit !== null &&
//       currentPlan.campaignLimit !== null &&
//       newPlan.campaignLimit <= currentPlan.campaignLimit
//     ) {
//       res.json({
//         success: false,
//         message: 'You can only upgrade to a higher plan',
//         data: null,
//       });
//       return;
//     }
//     if (newPlan.price === 0) {
//       //@ts-ignore
//       user.subscriptionPlan = newPlan._id;
//       user.subscriptionStart = new Date();
//       user.subscriptionEnd = undefined;
//       user.campaignsThisMonth = 0;
//       await user.save();
//       res.json({ success: true, message: 'Upgraded to free plan', data: null });
//       return;
//     }
//     const payment = await initiatePayment(
//       newPlan.price,
//       user.email,
//       '',
//       '',
//       `Upgrade to ${newPlan.name}`
//     );
//     if (!payment || !payment.payment_url) {
//       res.json({
//         success: false,
//         message: 'Payment initiation failed',
//         data: null,
//       });
//       return;
//     }
//     //@ts-ignore
//     user.subscriptionPlan = newPlan._id;
//     user.subscriptionStart = new Date();
//     user.subscriptionEnd = undefined;
//     user.campaignsThisMonth = 0;
//     await user.save();
//     res.json({
//       success: true,
//       message: 'Payment required for upgrade',
//       data: { paymentUrl: payment.payment_url },
//     });
//   } catch (err: any) {
//     res.json({ success: false, message: err.message, data: null });
//   }
// }

// Check if user can create a campaign (enforce plan limits)
export async function canCreateCampaign(userId: string): Promise<boolean> {
  try {
    const user = await User.findById(userId);
    if (!user || user.type !== 'business') return false;
    let subscriptionRemainingCampaigns = 0;
    const subscription = await Subscription.findOne({
      _id: user.activeSubscription,
      userId: userId,
      endDate: { $gt: new Date() },
      status: 'paid',
      startDate: { $lte: new Date() },
    });
    if (subscription) {
      subscriptionRemainingCampaigns = subscription.remainingCampaigns || 0;
    }
    //@ts-ignore
    return user.remainingCampaigns + subscriptionRemainingCampaigns > 0;
  } catch (err: any) {
    return false;
  }
}

// Increment campaign count for user
export async function incrementCampaignCount(userId: string) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const subscription = await Subscription.findOne({
      _id: user.activeSubscription,
      userId: userId,
      endDate: { $gt: new Date() },
      status: 'paid',
      startDate: { $lte: new Date() },
    });
    if (subscription) {
      subscription.remainingCampaigns -= 1;
      await subscription.save();
    } else {
      user.remainingCampaigns = (user.remainingCampaigns || 0) - 1;
      await user.save();
    }
  } catch (err: any) {
    // Handle error if needed
    console.error('Error incrementing campaign count:', err.message);
    logger.error(err.message);
    return;
  }
}

export async function getTotalRemainingCampaigns(userId: string) {
  try {
    const user = await User.findById(userId);
    if (!user) return 0;

    const subscription = await Subscription.findOne({
      _id: user.activeSubscription,
      userId: userId,
      endDate: { $gt: new Date() },
      status: 'paid',
      startDate: { $lte: new Date() },
    });
    let totalRemainingCampaigns = user.remainingCampaigns || 0;
    if (subscription) {
      totalRemainingCampaigns += subscription.remainingCampaigns || 0;
    }
    return totalRemainingCampaigns;
  } catch (err: any) {
    return 0;
  }
}
