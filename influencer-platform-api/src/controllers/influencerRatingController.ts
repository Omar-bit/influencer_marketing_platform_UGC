import { Request, Response } from 'express';
import InfluencerApplication from '@models/influencerApplication';
import User from '@models/user';
import logger from '@utils/logger';

// Get all influencers with their ratings
export const getInfluencersWithRatings = async (
  req: Request,
  res: Response
) => {
  try {
    const influencers = await User.find({ type: 'influencer' })
      .select(
        'name username profilePicture primaryNiche socialMedia spokenLanguages address'
      )
      .lean();

    const influencersWithRatings = await Promise.all(
      influencers.map(async (influencer) => {
        // Get all applications for this influencer with ratings
        const applications = await InfluencerApplication.find({
          influencer: influencer._id,
          status: 'accepted',
          'rating.rating': { $ne: null, $exists: true },
        }).lean();

        // Calculate average rating
        let averageRating = 0;
        if (applications.length > 0) {
          const totalRating = applications.reduce((sum, app) => {
            return sum + (app.rating?.rating || 0);
          }, 0);
          averageRating = parseFloat(
            (totalRating / applications.length).toFixed(1)
          );
        }

        // Get highest followers count from social media
        const highestFollowers = Math.max(
          ...(influencer.socialMedia?.map((sm: any) => sm.followers || 0) || [
            0,
          ])
        );

        // Get engagement rate
        const highestEngagement = Math.max(
          ...(influencer.socialMedia?.map(
            (sm: any) => sm.engagementRate || 0
          ) || [0])
        );

        // Get platforms
        const platforms =
          influencer.socialMedia?.map((sm: any) => sm.platform) || [];

        return {
          id: influencer._id,
          name: influencer.name,
          username: influencer.username,
          profilePicture: influencer.profilePicture,
          categories: [influencer.primaryNiche].filter(Boolean),
          followers: highestFollowers,
          engagement: highestEngagement,
          platforms,
          rating: averageRating,
          totalRatings: applications.length,
          location: influencer.address?.city || '',
          languages: influencer.spokenLanguages || [],
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Influencers with ratings retrieved successfully',
      data: influencersWithRatings,
    });
  } catch (error: any) {
    logger.error('Error fetching influencers with ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch influencers with ratings',
      error: error.message,
    });
  }
};

// Get detailed rating information for a specific influencer
export const getInfluencerRatingDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const { influencerId } = req.params;

    const applications = await InfluencerApplication.find({
      influencer: influencerId,
      status: 'accepted',
      'rating.rating': { $ne: null, $exists: true },
    })
      .populate('campaign', 'name description business')
      .populate({
        path: 'campaign',
        populate: {
          path: 'business',
          select: 'name profilePicture',
        },
      })
      .lean();

    const ratings = applications.map((app) => ({
      rating: app.rating?.rating || 0,
      feedback: app.rating?.feedback || '',
      campaign: app.campaign,
      ratedAt: app.updatedAt,
    }));

    const averageRating =
      ratings.length > 0
        ? parseFloat(
            (
              ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            ).toFixed(1)
          )
        : 0;

    res.status(200).json({
      success: true,
      message: 'Influencer rating details retrieved successfully',
      data: {
        influencerId,
        averageRating,
        totalRatings: ratings.length,
        ratings,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching influencer rating details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch influencer rating details',
      error: error.message,
    });
  }
};
