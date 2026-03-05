import * as ratingRoutes from '../routes/rating';
import { api } from '@/utils/axiosInstance';

/**
 * Submit a rating for an influencer application
 * @param applicationId ID of the application to be rated
 * @param rating Rating value (0-5)
 * @param feedback Optional feedback text
 */
export async function submitRating(
  applicationId: string,
  rating: number,
  feedback?: string
) {
  const { data } = await api.post(ratingRoutes.SUBMIT_RATING(applicationId), {
    rating,
    feedback,
  });
  return data;
}

/**
 * Get all ratings for a specific user
 * @param userId User ID to get ratings for
 */
export async function getUserRatings(userId: string) {
  const { data } = await api.get(ratingRoutes.GET_USER_RATINGS(userId));
  return data;
}

/**
 * Get average rating for a user
 * @param userId User ID to get average rating for
 */
export async function getUserAverageRating(userId: string) {
  const { data } = await api.get(ratingRoutes.GET_USER_AVERAGE_RATING(userId));
  return data;
}

/**
 * Submit a rating for an influencer by campaign ID
 * @param campaignId ID of the campaign
 * @param ratingData Object containing rating data (rating, ratedId, feedback)
 */
export async function submitRatingByCampaignId(
  campaignId: string,
  ratingData: {
    rating: number;
    ratedId: string;
    feedback?: string;
  }
) {
  const { data } = await api.post(
    ratingRoutes.SUBMIT_RATING_BY_CAMPAIGN_ID(campaignId),
    ratingData
  );
  return data;
}
