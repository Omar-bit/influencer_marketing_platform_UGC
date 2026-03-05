import User from '@models/user';
import logger from '@utils/logger';
import { Request, Response } from 'express';
import CampaignContent from '@models/campaignContent';
import InfluencerApplication from '@models/influencerApplication';
import mongoose from 'mongoose';

// Helper function to calculate average rating for an influencer
async function calculateAverageRating(influencerId: string): Promise<number> {
  try {
    const applications = await InfluencerApplication.find({
      influencer: influencerId,
      status: 'accepted',
      'rating.rating': { $ne: null, $exists: true },
    });

    if (applications.length === 0) {
      return 0;
    }

    const totalRating = applications.reduce((sum, app) => {
      return sum + (app.rating?.rating || 0);
    }, 0);

    return parseFloat((totalRating / applications.length).toFixed(1));
  } catch (error) {
    logger.error(
      `Error calculating average rating for influencer ${influencerId}:`,
      error
    );
    return 0;
  }
}

export default async function getAllInfluencers(req: Request, res: Response) {
  try {
    const influencers = await User.find(
      {
        type: 'influencer',
      },
      {
        password: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      }
    );

    // Calculate ratings for each influencer
    const influencersWithRatings = await Promise.all(
      influencers.map(async (influencer) => {
        const averageRating = await calculateAverageRating(influencer._id);
        return {
          ...influencer.toObject(),
          averageRating,
        };
      })
    );

    res.status(200).json({
      message: 'Influencers fetched successfully',
      data: influencersWithRatings,
    });

    return;
  } catch (error: any) {
    logger.error('Error fetching influencers:', error);
    res.status(500).json({
      message: 'Error fetching influencers',
      error: error.message,
    });
    return;
  }
}

export async function updateInfluencerProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Fix file handling for multer's upload.fields()
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    // Get profile picture if uploaded
    const profilePicture = files?.profilePicture?.[0]?.filename;

    // Get portfolio image if uploaded
    const portfolioImage = files?.portfolioImage?.[0]?.filename;

    delete updateData.email;
    delete updateData._id;

    // Parse JSON fields if they're strings
    if (typeof updateData.spokenLanguages === 'string') {
      try {
        updateData.spokenLanguages = JSON.parse(updateData.spokenLanguages);
      } catch (e) {
        console.error('Error parsing spokenLanguages:', e);
      }
    }

    if (typeof updateData.address === 'string') {
      try {
        updateData.address = JSON.parse(updateData.address);
      } catch (e) {
        console.error('Error parsing address:', e);
      }
    }

    // Parse secondaryNiches field if it exists and is a string
    if (typeof updateData.secondaryNiches === 'string') {
      try {
        updateData.secondaryNiches = JSON.parse(updateData.secondaryNiches);
      } catch (e) {
        console.error('Error parsing secondaryNiches:', e);
      }
    }

    if (typeof updateData.portfolio === 'string') {
      try {
        updateData.portfolio = JSON.parse(updateData.portfolio);
      } catch (e) {
        console.error('Error parsing portfolio:', e);
      }
    }

    if (typeof updateData.minimumRates === 'string') {
      try {
        updateData.minimumRates = JSON.parse(updateData.minimumRates);
      } catch (e) {
        console.error('Error parsing minimumRates:', e);
      }
    }

    if (typeof updateData.shippingAddress === 'string') {
      try {
        updateData.shippingAddress = JSON.parse(updateData.shippingAddress);
      } catch (e) {
        console.error('Error parsing shippingAddress:', e);
      }
    }

    if (profilePicture) {
      updateData.profilePicture = profilePicture;
    }

    if (portfolioImage) {
      const user = await User.findById(id);

      if (!user) {
        res.status(404).json({ message: 'Influencer not found' });
        return;
      }

      const portfolio = user.portfolio || [];
      portfolio.push(portfolioImage);
      updateData.portfolio = portfolio;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: id, type: 'influencer' },
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      res.status(404).json({ message: 'Influencer not found' });
      return;
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    logger.error('Error updating influencer profile:', error);
    res.status(500).json({
      message: 'Error updating influencer profile',
      error: error.message,
    });
  }
}

export async function getPersonalProfileById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    //@ts-ignore
    const userId = req.user.userId;
    if (userId !== id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    if (!id) {
      res.status(400).json({ message: 'ID is required' });
      return;
    }

    const influencer = await User.findOne(
      { _id: id, type: 'influencer' },
      {
        password: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
        otpCode: 0,
        failedAttempts: 0,
        lockUntil: 0,
        passKey: 0,
      }
    );

    if (!influencer) {
      res.status(404).json({ message: 'Influencer not found' });
      return;
    }

    res.status(200).json({
      message: 'Influencer fetched successfully',
      data: influencer,
    });
  } catch (error: any) {
    logger.error('Error fetching influencer:', error);
    res.status(500).json({
      message: 'Error fetching influencer',
      error: error.message,
    });
  }
}

export async function getInfluencerById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: 'ID is required' });
      return;
    }

    const influencer = await User.findOne(
      { _id: id, type: 'influencer' },
      {
        password: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
        otpCode: 0,
        failedAttempts: 0,
        lockUntil: 0,
        passKey: 0,
      }
    );

    if (!influencer) {
      res.status(404).json({ message: 'Influencer not found' });
      return;
    }

    res.status(200).json({
      message: 'Influencer fetched successfully',
      data: influencer,
    });
  } catch (error: any) {
    logger.error('Error fetching influencer:', error);
    res.status(500).json({
      message: 'Error fetching influencer',
      error: error.message,
    });
  }
}

export async function getInfluencerIncomes(req: Request, res: Response) {
  //@ts-ignore
  const userId = req.user?.userId;
  console.log('User ID:', userId);
  try {
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    // const user = await User.findById(userId);

    // if (!user) {
    //   res.status(403).json({
    //     success: false,
    //     message: 'Only influencers can access their income data',
    //   });
    //   return;
    // }
    const applications = await InfluencerApplication.find({
      influencer: userObjectId,
      status: 'accepted',
    }).select('_id campaign');

    const applicationIds = applications.map((app) => app._id);

    // Find all content related to the influencer's accepted applications
    const allContent = await CampaignContent.find({
      application: { $in: applicationIds },
    })
      .populate({
        path: 'application',
        populate: {
          path: 'campaign',
          select: 'name description budget image business nbrOfInfluencers',
        },
      })
      .sort({ createdAt: -1 }); // Transform all content into income entries
    const allIncomes = allContent
      .map((content) => {
        // @ts-ignore
        const campaign = content.application?.campaign;
        let amount = content.application.price;
        console.log('amount:', amount);
        if (!amount) {
          amount = campaign.budget;
        }
        return {
          id: content._id,
          campaign: campaign,
          amount: amount,
          paymentStatus: content.isPaid ? 'paid' : 'pending',
          paymentRef: content.paymentRef || null,
          contentId: content._id,
          createdAt: content.createdAt,
          contentTitle: content.title,
          type: 'content',
          tags: content.tags,
          contentStatus: content.status,
          isPaid: content.isPaid,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ); // Calculate summary data
    const paidContent = allContent.filter((content) => content.isPaid);
    const pendingContent = allContent.filter(
      (content) => !content.isPaid && content.status === 'accepted'
    );
    const totalPostedContent = allContent.filter(
      (content) => content.status === 'posted'
    ).length; // Calculate total income (from paid content only)
    const totalIncome = paidContent.reduce((total, content) => {
      // @ts-ignore
      const application = content.application;
      const campaign = application?.campaign;

      // Use application price if available, otherwise use campaign budget
      let amount = application?.price;
      if (!amount && campaign?.budget) {
        amount = campaign.budget;
      }

      return total + (amount || 0);
    }, 0); // Calculate potential income (from pending content)
    const potentialIncome = pendingContent.reduce((total, content) => {
      // @ts-ignore
      const application = content.application;
      const campaign = application?.campaign;

      // Use application price if available, otherwise use campaign budget
      let amount = application?.price;
      if (!amount && campaign?.budget) {
        amount = campaign.budget;
      }

      return total + (amount || 0);
    }, 0);

    const summary = {
      totalIncome,
      potentialIncome,
      totalPaidContent: paidContent.length,
      totalPendingContent: pendingContent.length,
      totalPostedContent,
    };

    res.status(200).json({
      success: true,
      message: 'Influencer incomes fetched successfully',
      data: {
        incomes: allIncomes,
        summary,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching influencer incomes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching influencer incomes',
      error: error.message,
    });
  }
}
