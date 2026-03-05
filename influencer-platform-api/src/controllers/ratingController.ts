import { Request, Response } from 'express';
import InfluencerApplication from '../models/influencerApplication';
import Campaign from '../models/campaign';
import User from '../models/user';
import mongoose from 'mongoose';
import logger from '@utils/logger';

// Submit a rating for an application
export const submitRating = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { rating, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid application ID format',
      });
      return;
    }

    if (!rating || rating < 0 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5',
      });
      return;
    }

    const application = await InfluencerApplication.findById(applicationId);

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    if (application.status !== 'accepted') {
      res.status(400).json({
        success: false,
        message: 'Cannot rate applications that are not accepted',
      });
      return;
    }

    // Update application with rating
    application.rating = {
      rating: rating,
      feedback: feedback || '',
    };

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: application,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while submitting rating',
    });
  }
};
export const submitRatingByCampaingId = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const { rating, feedback, ratedId } = req.body;
    //@ts-ignore
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid campaign ID format',
      });
      return;
    }

    if (!rating || rating < 0 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5',
      });
      return;
    }

    const campaign = await Campaign.findOne({
      _id: campaignId,
      business: userId,
    });

    if (!campaign) {
      res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
      return;
    }
    const application = await InfluencerApplication.findOne({
      campaign: campaignId,
      influencer: ratedId,
      status: 'accepted',
    });

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    // Update application with rating
    application.rating = {
      rating: rating,
      feedback: feedback || '',
    };

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: application,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while submitting rating',
    });
  }
};

// Get all ratings for a specific user
export const getUserRatings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
      return;
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Find all applications where this user is either the influencer or the owner of the campaign
    const applications = await InfluencerApplication.find(
      {
        influencer: userId,

        status: 'accepted',
        rating: { $ne: null },
      },
      {
        proposal: 0,
        status: 0,
      }
    )
      .populate('influencer', 'name profilePicture primaryNiche')
      .populate({
        path: 'campaign',
        select: 'name startDate endDate business',
        populate: {
          path: 'business',
          select: 'name profilePicture field',
        },
      });

    const ratings = await Promise.all(
      applications.map(async (app: any) => {
        const ratedUserId = app.influencer._id;
        const ratorId = app.campaign.business._id;

        const ratedUser = await User.findById(ratedUserId).select(
          'name profilePicture primaryNiche field type'
        );
        const rator = await User.findById(ratorId).select(
          'name profilePicture primaryNiche field type'
        );

        if (!ratedUser || !rator) {
          return null;
        }

        return {
          _id: app._id,
          rating: app.rating.rating,
          feedback: app.rating.feedback,
          ratedUser: {
            _id: ratedUser._id,
            name: ratedUser.name,
            profilePicture: ratedUser.profilePicture,
            type: ratedUser.type,
            field: ratedUser.field,
            primaryNiche: ratedUser.primaryNiche,
          },
          rater: {
            _id: rator._id,
            name: rator.name,
            profilePicture: rator.profilePicture,
            type: rator.type,
            field: rator.field,
            primaryNiche: rator.primaryNiche,
          },
          campaign: {
            _id: app.campaign._id,
            name: app.campaign.name,
            duration:
              app.campaign.startDate && app.campaign.endDate
                ? `${new Date(
                    app.campaign.startDate
                  ).toLocaleDateString()} - ${new Date(
                    app.campaign.endDate
                  ).toLocaleDateString()}`
                : 'No duration specified',
          },
          createdAt: app.updatedAt,
        };
      })
    );

    // // Filter out any null results
    const validRatings = ratings.filter((rating) => rating !== null);

    res.status(200).json({
      success: true,
      message: 'Ratings retrieved successfully',
      data: validRatings,
    });
  } catch (error: any) {
    logger.error('GET RATINGS: ' + error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while retrieving ratings',
    });
  }
};

// Get average rating for a user
export const getUserAverageRating = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
      return;
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Find all ratings for this user
    const applications = await InfluencerApplication.find({
      $or: [
        { influencer: userId },
        {
          campaign: {
            $in: (
              await Campaign.find({ business: userId })
            ).map((camp) => camp._id),
          },
        },
      ],
      status: 'accepted',
      rating: { $ne: null },
    });

    if (applications.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No ratings found for this user',
        data: {
          averageRating: 0,
          totalRatings: 0,
        },
      });
      return;
    }

    // Calculate the average rating
    const totalRating = applications.reduce(
      (sum, app) => sum + (app.rating?.rating || 0),
      0
    );
    const averageRating = totalRating / applications.length;

    res.status(200).json({
      success: true,
      message: 'Average rating retrieved successfully',
      data: {
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings: applications.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message:
        error.message || 'An error occurred while retrieving average rating',
    });
  }
};
