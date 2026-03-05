import cron from 'node-cron';
import mongoose from 'mongoose';
import CampaignContent, { ICampaignContent } from '../models/campaignContent';
import InfluencerApplication from '../models/influencerApplication';
import User, { IUser } from '../models/user';
import logger from '../utils/logger';
import { getInstagramMetrics } from '../services/instagramPublishingService';
import { getTiktokMetrics } from '../services/tiktokPublishingService';
import { MONGO_URI } from '../utils/secrets';

interface PostMetrics {
  likes?: number;
  comments?: number;
  views?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
  fetchedAt?: Date;
}
[];

async function updateContentMetrics() {
  try {
    logger.info('Starting campaign content metrics update job');

    const contents = await CampaignContent.find({
      status: 'posted',
      'posts.0': { $exists: true },
    });

    logger.info(
      `Found ${contents.length} posted campaign contents to update metrics`
    );

    let updatedContents = 0;
    let updatedPosts = 0;

    for (const content of contents) {
      const application = await InfluencerApplication.findById(
        content.application
      );
      if (!application) {
        logger.warn(`Application not found for content ${content._id}`);
        continue;
      }

      const influencer = await User.findById(application.influencer);
      if (!influencer) {
        logger.warn(`Influencer not found for application ${application._id}`);
        continue;
      }

      let contentUpdated = false;

      for (const post of content.posts || []) {
        try {
          const socialMedia = influencer.socialMedia?.find(
            (platform: any) => platform.platform === post.platform
          );

          if (!socialMedia || !socialMedia.accessToken) {
            logger.warn(
              `No access token found for ${post.platform} platform for influencer ${influencer._id}`
            );
            continue;
          }

          let metrics: {
            shares: number;
            comments: number;
            likes: number;
            views: number;
            saved?: number;
            total_interactions?: number;
            reach?: number;
          };
          switch (post.platform) {
            case 'instagram':
              metrics = await getInstagramMetrics(
                post.postId,
                socialMedia.accessToken
              );
              break;
            case 'tiktok':
              metrics = await getTiktokMetrics(
                post.postId,
                socialMedia.accessToken
              );
              break;
            default:
              logger.warn(
                `Platform ${post.platform} not supported for metrics fetching`
              );
              continue;
          }

          const metricsEntry: PostMetrics = {
            likes: metrics.likes || 0,
            comments: metrics.comments || 0,
            views: metrics.views || 0,
            shares: metrics.shares || 0,
            reach: metrics.reach || 0,
            // impressions: metrics.impressions || 0,
            fetchedAt: new Date(),
          };

          const previousMetrics = post.metrics || [];
          const newMetrics = [...previousMetrics, metricsEntry];
          post.metrics = newMetrics;

          contentUpdated = true;
          updatedPosts++;

          logger.info(
            `Updated metrics for ${post.platform} post ${post.postId}`
          );
        } catch (error) {
          logger.error(
            `Error updating metrics for post ${post.postId}: ${error}`
          );
        }
      }

      if (contentUpdated) {
        await content.save();
        updatedContents++;
      }
    }

    logger.info(
      `Completed metrics update job - Updated ${updatedContents} contents and ${updatedPosts} posts`
    );
  } catch (error) {
    logger.error(`Error in content metrics update job: ${error}`);
  }
}

export function initContentMetricsUpdateJob() {
  // '0 * * * *' = At minute 0 of every hour (hourly)
  cron.schedule('0 * * * *', updateContentMetrics);
  logger.info('Scheduled hourly campaign content metrics update job');

  updateContentMetrics();
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

export default initContentMetricsUpdateJob;
