import cron from 'node-cron';
import mongoose from 'mongoose';
import CampaignContent, { ICampaignContent } from '../models/campaignContent';
import InfluencerApplication from '../models/influencerApplication';
import User, { IUser } from '../models/user';
import logger from '../utils/logger';
import { getInstagramMetrics } from '../services/instagramPublishingService';
import { getTiktokMetrics } from '../services/tiktokPublishingService';
import { MONGO_URI } from '../utils/secrets';
import Subscription from '../models/subscriptions';

async function updateSubscription() {
  try {
    logger.info('Starting subscription update job');

    // Find all users with active subscriptions
    const users = await User.find({
      activeSubscription: { $ne: null },
    });

    logger.info(`Found ${users.length} users with active subscriptions`);

    const currentDate = new Date();
    let expiredCount = 0;

    // Check each user's subscription
    for (const user of users) {
      const subscription = await Subscription.findById(user.activeSubscription);

      // If subscription exists and has expired (end date < current date)
      if (subscription && subscription.endDate < currentDate) {
        logger.info(
          `Subscription expired for user: ${user._id}, email: ${user.email}`
        );

        // Set user's activeSubscription to undefined
        user.activeSubscription = undefined;
        await user.save();

        expiredCount++;
      }
    }

    logger.info(
      `Subscription update job completed. Found ${expiredCount} expired subscriptions.`
    );
  } catch (error) {
    logger.error(`Error in subscription update job: ${error}`);
  }
}

export function initUpdateSubscriptionJob() {
  // '0 * * * *' = At minute 0 of every hour (hourly)
  cron.schedule('0 * * * *', updateSubscription);
  logger.info('Scheduled subscription update job');

  updateSubscription();
  //   setTimeout(() => {
  //     updateContentMetrics();
  //   }, 15000);
}

//test
// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     updateContentMetrics();
//   })
//   .catch((error) => {
//     logger.error('Error connecting to MongoDB', error);
//   });

export default initUpdateSubscriptionJob;
