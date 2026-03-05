import cron from 'node-cron';
import User, { IUser } from '@models/user';
import logger from '@utils/logger';
import { updateUserSocialMediaMetrics } from '@services/socialMediaMetricsService';

async function updateAllSocialMediaMetrics() {
  try {
    logger.info('Starting social media metrics update job');

    const users: IUser[] = await User.find({
      'socialMedia.0': { $exists: true },
    });

    let updatedUsers = 0;
    let updatedPlatforms = 0;

    for (const user of users) {
      const result = await updateUserSocialMediaMetrics(user);

      if (result.updated) {
        updatedUsers++;
        updatedPlatforms += result.platforms.length;
      }
    }

    logger.info(
      `Completed metrics update job - Updated ${updatedUsers} users and ${updatedPlatforms} platform accounts`
    );
  } catch (error) {
    logger.error(`Error in metrics update job: ${error}`);
  }
}

// Run the metrics update every hour
// '0 * * * *' = At minute 0 of every hour (hourly)
export function initMetricsUpdateJob() {
  cron.schedule('* * * * *', updateAllSocialMediaMetrics);
  logger.info('Scheduled hourly social media metrics update job');

  setTimeout(() => {
    updateAllSocialMediaMetrics();
  }, 10000); // Wait 10 seconds after server start before initial update
}

export default initMetricsUpdateJob;
