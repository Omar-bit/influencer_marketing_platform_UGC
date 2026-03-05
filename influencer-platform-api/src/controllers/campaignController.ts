import Campaign from '@models/campaign';
import { Request, Response } from 'express';
import logger from '@utils/logger';
import {
  validateCampaignData,
  validateCampaignStatus,
  validateDraftCampaignData,
} from '@utils/campaign/helpers';
import { campaignStatusType } from 'src/types/campaign';
import InfluencerApplication from '@models/influencerApplication';
import { Types } from 'mongoose';
import User from '@models/user';
import { createChatRoom } from '@controllers/chatController';
import { createNotification } from '@controllers/notificationController';
import CampaignContent from '@models/campaignContent';
import { generateGLBModelFromImage } from '@services/threeDService';
import path from 'path';
import { getPaymentStatus, initiatePayment } from '@services/paymentService';
import ProductSale from '@models/productSale';
import {
  canCreateCampaign,
  incrementCampaignCount,
} from './subscriptionController';
import InfluencersLists from '@models/influencersLists';
import CampaignInvitation from '@models/campaignInvitation';
import { Product, IProduct } from '@models/product';
import { generateUniqueProductUrlCode } from '@utils/generateProductUrlCode';

export async function createCampaign(req: Request, res: Response) {
  try {
    // @ts-ignore
    const businessId = req?.user?.userId;
    const user = await User.findById(businessId);
    if (!user) throw new Error('User not found');
    if (user.type === 'business') {
      const allowed = await canCreateCampaign(businessId);
      if (!allowed) {
        res.status(403).json({
          success: false,
          message: 'Campaign limit reached for your subscription plan.',
        });
        return;
      }
    }

    const campaignData = {
      ...req.body,
      // @ts-ignore
      business: businessId,
      // @ts-ignore
      image: req.files?.image?.[0]?.filename,
      status: 'pending',
    };

    // Handle product selection
    if (campaignData.productId) {
      const product = await Product.findOne({
        _id: campaignData.productId,
        brand: businessId,
      });

      if (!product) {
        throw new Error(
          'Selected product not found or not owned by your brand'
        );
      }

      campaignData.product = product._id;
      delete campaignData.productId; // Remove the temporary productId field
    } else {
      throw new Error('Product selection is required');
    }

    const isIncorrectData = validateCampaignData(campaignData);
    if (isIncorrectData) {
      throw new Error(isIncorrectData);
    }

    // Handle isPublic flag - default to true if not specified
    if (campaignData.isPublic === undefined) {
      campaignData.isPublic = true;
    } else {
      // Convert string 'true'/'false' to boolean
      campaignData.isPublic =
        campaignData.isPublic === 'true' || campaignData.isPublic === true;
    }

    const campaign = new Campaign(campaignData);
    await campaign.save();
    await incrementCampaignCount(businessId);
    logger.info('Campaign created successfully');

    // If the campaign is private, process the influencer list invitations
    if (
      !campaignData.isPublic &&
      campaignData.targetedInfluencerLists &&
      campaignData.targetedInfluencerLists.length > 0
    ) {
      await processCampaignInvitations(
        campaign._id.toString(),
        campaignData.targetedInfluencerLists,
        businessId
      );
    }

    logger.info(`Campaign created with ID: ${campaign._id.toString()}`);

    res.status(201).json({
      success: true,
      message: 'Campaign has been created successfully!',
      data: campaign,
    });
  } catch (error: any) {
    logger.error(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Process campaign invitations for private campaigns
 * Gets all influencers from the selected lists and creates invitations for them
 */
async function processCampaignInvitations(
  campaignId: string | Types.ObjectId,
  listIds: string[] | Types.ObjectId[],
  businessId: string | Types.ObjectId
) {
  try {
    // Get all influencer lists
    const influencerLists = await InfluencersLists.find({
      _id: { $in: listIds },
      businessId: businessId,
    });

    if (!influencerLists || influencerLists.length === 0) {
      logger.warn(`No valid influencer lists found for campaign ${campaignId}`);
      return;
    }

    // Extract all unique influencer IDs from the lists
    const influencerIds = new Set<string>();
    influencerLists.forEach((list) => {
      list.influencers.forEach((influencerId: Types.ObjectId | string) => {
        influencerIds.add(influencerId.toString());
      });
    });

    if (influencerIds.size === 0) {
      logger.warn(
        `No influencers found in the selected lists for campaign ${campaignId}`
      );
      return;
    }

    // Create invitations for each influencer
    const invitations = Array.from(influencerIds).map((influencerId) => ({
      campaign: campaignId,
      influencer: influencerId,
      status: 'pending',
    }));

    // Bulk insert all invitations
    await CampaignInvitation.insertMany(invitations);

    // Update the campaign with the list of invited influencers
    await Campaign.findByIdAndUpdate(campaignId, {
      invitedInfluencers: Array.from(influencerIds),
    });

    // Send notifications to all invited influencers
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      logger.error(`Campaign ${campaignId} not found when sending invitations`);
      return;
    }

    for (const influencerId of influencerIds) {
      await createNotification(
        influencerId,
        'New Campaign Invitation',
        `You've been invited to join the campaign "${campaign.name}"`,
        'campaign'
      );
    }

    logger.info(
      `Successfully sent ${influencerIds.size} invitations for campaign ${campaignId}`
    );
  } catch (error) {
    logger.error(`Error processing campaign invitations: ${error}`);
    throw error;
  }
}

export async function draftCampaign(req: Request, res: Response) {
  try {
    const campaignData = {
      ...req.body,
      // @ts-ignore
      business: req?.user?.userId,
      // @ts-ignore
      image: req.files?.image?.[0]?.filename,
      status: 'draft',
    };

    // Handle product selection for draft
    if (campaignData.productId) {
      const product = await Product.findOne({
        _id: campaignData.productId,
        // @ts-ignore
        brand: req?.user?.userId,
      });

      if (!product) {
        throw new Error(
          'Selected product not found or not owned by your brand'
        );
      }

      campaignData.product = product._id;
      delete campaignData.productId; // Remove the temporary productId field
    }

    const isIncorrectData = validateDraftCampaignData(campaignData);
    if (isIncorrectData) {
      throw new Error(isIncorrectData);
    }

    const campaign = new Campaign(campaignData);
    await campaign.save();
    logger.info('Campaign draft created successfully');
    res.status(201).json({
      success: true,
      message: 'Campaign draft has been created successfully!',
      data: campaign,
    });
  } catch (error: any) {
    logger.error(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getAllCampaigns(req: Request, res: Response) {
  try {
    //@ts-ignore
    const userId = req.user.userId;
    const campaigns = await Campaign.find({
      status: 'pending',
    });
    const user = await User.findById(userId);
    const bookmarkedCampaignIds = user?.bookmarkedCampaigns || [];
    const campaignsWithBookmarkStatus = campaigns.map((campaign) => {
      const isSaved = bookmarkedCampaignIds.some(
        // @ts-ignore
        (id) => id.toString() === campaign._id.toString()
      );

      const modifiedCampaign = campaign.toObject();
      // @ts-ignore
      modifiedCampaign.isSaved = isSaved;
      return modifiedCampaign;
    });

    res.json({
      success: true,
      message: 'Campaigns retrieved successfully',
      data: campaignsWithBookmarkStatus,
    });
  } catch (error: any) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCampaignById(req: Request, res: Response) {
  try {
    // const campaign = await useCache(
    //   `campaign:${req.params.id}`,
    //   async () => {
    //     return await Campaign.findById(req.params.id);
    //   },
    //   300
    // );
    // @ts-ignore
    const { userId, type: userType } = req?.user;

    const campaign = await Campaign.findById(req.params.id, {
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    })
      .populate('business', 'name profilePicture email')
      .populate('product');
    const userOwnsCampaign =
      // @ts-ignore
      campaign?.business?._id?.toString() === userId || userType === 'admin';
    if (
      !userOwnsCampaign &&
      campaign?.status &&
      !['closed', 'pending'].includes(campaign?.status)
    ) {
      res
        .status(403)
        .json({ message: 'You are not authorized to view this campaign' });
      return;
    }
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }

    res.json({
      data: campaign,
      success: true,
      message: 'Campaign retrieved successfully',
    });
  } catch (error: any) {
    logger.error(error.message);

    res.status(500).json({ success: false, message: error.message });
  }
}
export async function getCampaignByBusiness(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.query;
  if (!id) {
    res
      .status(400)
      .json({ success: false, message: 'Business ID is required' });
    return;
  }
  if (status && validateCampaignStatus(status as string)) {
    res.status(400).json({
      success: false,
      message: validateCampaignStatus(status as string),
    });
    return;
  }
  try {
    // const campaigns = await useCache(
    //   `business-campaigns:${req.params.id}`,
    //   async () => {
    //     return await Campaign.find({ business: req.params.id });
    //   },
    //   300
    // );
    const query: any = { business: id };
    if (status) query.status = status;
    const campaigns = await Campaign.find(query)
      .populate('business', 'name profilePicture')
      .populate('product');

    res.json({
      data: campaigns,
      success: true,
      message: 'Campaigns retrieved successfully',
    });
  } catch (error: any) {
    logger.error(error.message);

    res.status(500).json({ success: false, message: error.message });
  }
}

export async function editCampaign(req: Request, res: Response) {
  if (req.params.id)
    try {
      let productFiles: string[] = [];
      if (req.files && 'productFiles' in req.files) {
        // @ts-ignore
        productFiles = req.files.productFiles.map((file) => ({
          file: file.filename,
        }));
      }

      let campaign = await Campaign.findById({ _id: req.params.id });
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // @ts-ignore
      if (campaign.business.toString() !== req?.user?.userId?.toString()) {
        throw new Error('You are not authorized to edit this campaign');
      }

      // Prepare campaign data
      const campaignData: any = {
        ...req.body,
      };

      // Add image if provided
      // @ts-ignore
      if (req.files?.image?.[0]?.filename) {
        // @ts-ignore
        campaignData.image = req.files.image[0].filename;
      }

      if (req.body.product) {
        try {
          if (typeof req.body.product === 'string') {
            campaignData.product = JSON.parse(req.body.product);
          }
        } catch (e) {
          logger.error('Error parsing product data:', e);
        }
      }

      if (req.body.affiliate) {
        try {
          if (typeof req.body.affiliate === 'string') {
            campaignData.affiliate = JSON.parse(req.body.affiliate);
          }
        } catch (e) {
          logger.error('Error parsing affiliate data:', e);
        }
      }

      if (productFiles.length > 0 && campaignData.product) {
        campaignData.product.files = productFiles;
      }

      if (req.body['platforms[]']) {
        campaignData.platforms = Array.isArray(req.body['platforms[]'])
          ? req.body['platforms[]']
          : [req.body['platforms[]']];
      }

      if (campaign.status === 'draft' && campaignData.status === 'pending') {
        const isIncorrectData = validateCampaignData(campaignData);
        if (isIncorrectData) {
          throw new Error(isIncorrectData);
        }
      } else if (
        campaign.status === 'draft' &&
        campaignData.status === 'draft'
      ) {
        const isIncorrectData = validateDraftCampaignData(campaignData);
        if (isIncorrectData) {
          throw new Error(isIncorrectData);
        }
      }
      if (campaignData.status === 'pending') {
        const isPublishingPossible = canCreateCampaign(
          campaign.business.toString()
        );
        if (!isPublishingPossible) {
          res.status(403).json({
            success: false,
            message: 'Campaign limit reached for your subscription plan.',
          });
          return;
        }
      }
      try {
        const statusMessages = {
          pending: 'Your campaign has been approved and is now live.',
          closed: 'Your campaign has been closed.',
          rejected:
            'Your campaign has been rejected. Please check the requirements and resubmit.',
          paused: 'Your campaign has been paused.',
          unpaid:
            'Your campaign is unpaid. Please complete the payment to activate it.',
        };

        const message =
          statusMessages[campaignData.status as keyof typeof statusMessages] ||
          `Your campaign status has been updated to ${campaignData.status}.`;

        if (campaign.status !== campaignData.status) {
          await createNotification(
            campaign.business.toString(),
            `Campaign Status Updated`,
            message,
            'campaign'
          );
        }
      } catch (error) {
        logger.error(
          `Failed to create notification for campaign status update: ${error}`
        );
      }

      campaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        { ...campaignData, status: 'pending' },
        {
          new: true,
        }
      );

      if (!campaign) {
        res.status(404).json({ success: false, message: 'Campaign not found' });
        return;
      }

      logger.info('Campaign updated successfully');

      res.json({
        success: true,
        message: 'Campaign updated successfully',
        data: campaign,
      });
    } catch (error: any) {
      logger.error(error.message);
      res.status(400).json({ success: false, message: error.message });
    }
}

export async function deleteCampaign(req: Request, res: Response) {
  try {
    let campaign = await Campaign.findOne({ _id: req.params.id });
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    // @ts-ignore
    if (campaign.business.toString() !== req?.user?.userId?.toString()) {
      throw new Error('You are not authorized to delete this campaign');
    }
    campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    logger.info('Campaign deleted successfully');

    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error: any) {
    logger.error(error.message);

    res.status(500).json({ success: false, message: error.message });
  }
}

export async function applyToCampaign(req: Request, res: Response) {
  try {
    const { campaignId } = req.params;
    const { proposal } = req.body;
    // @ts-ignore
    const influencerId = req.user?.userId;
    const influencer = await User.findById(influencerId);
    if (!influencer) {
      res.status(404).json({
        success: false,
        message: 'Influencer not found',
      });
      return;
    }
    if (!influencer.walletId) {
      res.status(400).json({
        success: false,
        message: 'Influencer wallet ID is required to apply for jobs',
      });
      return;
    }
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    if (campaign.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Applications can only be submitted to pending campaigns',
      });
      return;
    }

    const existingApplication = await InfluencerApplication.findOne({
      campaign: campaignId,
      influencer: influencerId,
    });

    if (existingApplication) {
      res.status(400).json({
        success: false,
        message: 'You have already applied to this campaign',
      });
      return;
    }

    const application = new InfluencerApplication({
      campaign: campaignId,
      influencer: influencerId,
      proposal,
      status: 'pending',
    });

    await application.save();

    try {
      await createNotification(
        campaign.business.toString(),
        'New Campaign Application',
        `An influencer has applied to your campaign "${campaign.name}".`,
        'campaign'
      );
    } catch (error) {
      logger.error(
        `Failed to create notification for new application: ${error}`
      );
    }

    logger.info(`New application submitted for campaign ${campaignId}`);
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error: any) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCampaignApplications(req: Request, res: Response) {
  try {
    const { campaignId } = req.params;
    const { status } = req.query;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    // @ts-ignore
    const userId = req.user?.userId;

    if (campaign.business.toString() !== userId) {
      res.status(403).json({
        success: false,
        message:
          'You are not authorized to view applications for this campaign',
      });
      return;
    }

    const query: any = { campaign: campaignId };
    if (status) {
      query.status = status;
    }

    const applications = await InfluencerApplication.find(query)
      .populate('influencer', 'name email profilePicture')
      .select('-__v');

    res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: applications,
    });
  } catch (error: any) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getInfluencerApplications(req: Request, res: Response) {
  try {
    // @ts-ignore
    const influencerId = req.user?.userId;
    const { status } = req.query;

    const query: any = { influencer: influencerId };
    if (status) {
      query.status = status;
    }

    const applications = await InfluencerApplication.find(query)
      .populate('campaign')
      .select('-__v');

    const user = await User.findById(influencerId);
    const bookmarkedCampaignIds = user?.bookmarkedCampaigns || [];

    const applicationsWithBookmarkStatus = applications.map((application) => {
      const isSaved = bookmarkedCampaignIds.some(
        // @ts-ignore
        (id) => id.toString() === application.campaign._id.toString()
      );

      const modifiedApplication = application.toObject();
      // @ts-ignore
      modifiedApplication.campaign.isSaved = isSaved;
      return modifiedApplication;
    });

    res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: applicationsWithBookmarkStatus,
    });
  } catch (error: any) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateApplicationStatus(req: Request, res: Response) {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await InfluencerApplication.findById(applicationId);
    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    const campaign = await Campaign.findById(application.campaign);
    if (!campaign) {
      res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
      return;
    }

    // @ts-ignore
    const userId = req.user?.userId;
    if (campaign.business.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to update this application',
      });
      return;
    }

    // If the application is being accepted and product purchase is enabled
    if (status === 'accepted' && campaign.enableProductPurchase) {
      try {
        const productUrlCode = await generateUniqueProductUrlCode();
        application.productUrlCode = productUrlCode;
      } catch (error) {
        logger.error(`Failed to generate product URL code: ${error}`);
        res.status(500).json({
          success: false,
          message: 'Failed to generate product URL code',
        });
        return;
      }
    }
    if (status === 'accepted') {
      await createChatRoom(
        applicationId,
        campaign.id,
        campaign.business.toString(),
        application.influencer.toString()
      );
    }

    application.status = status;
    await application.save();

    // Create notification for the influencer
    try {
      await createNotification(
        application.influencer.toString(),
        'Application Status Updated',
        `Your application for campaign "${campaign.name}" has been ${status}`,
        'campaign'
      );
    } catch (error) {
      logger.error(`Failed to create notification: ${error}`);
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  } catch (error: any) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

// export async function rateApplication(req: Request, res: Response) {
//   try {
//     const { applicationId } = req.params;
//     const { rating } = req.body;

//     if (
//       !rating ||
//       isNaN(Number(rating)) ||
//       Number(rating) < 1 ||
//       Number(rating) > 5
//     ) {
//       res.status(400).json({
//         success: false,
//         message: 'Rating must be a number between 1 and 5',
//       });
//       return;
//     }

//     const application = await InfluencerApplication.findById(applicationId);
//     if (!application) {
//       res
//         .status(404)
//         .json({ success: false, message: 'Application not found' });
//       return;
//     }

//     const campaign = await Campaign.findById(application.campaign);
//     if (!campaign) {
//       res.status(404).json({ success: false, message: 'Campaign not found' });
//       return;
//     }

//     // @ts-ignore
//     const userId = req.user?.userId;

//     if (campaign.business.toString() !== userId) {
//       res.status(403).json({
//         success: false,
//         message: 'You are not authorized to rate this application',
//       });
//       return;
//     }

//     if (application.status !== 'accepted') {
//       res.status(400).json({
//         success: false,
//         message: 'Only accepted applications can be rated',
//       });
//       return;
//     }

//     application.rating = Number(rating);
//     await application.save();

//     logger.info(`Application ${applicationId} rated with ${rating} stars`);
//     res.status(200).json({
//       success: true,
//       message: 'Application rated successfully',
//       data: application,
//     });
//   } catch (error: any) {
//     logger.error(error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// }

export async function deleteApplication(req: Request, res: Response) {
  try {
    const { applicationId } = req.params;

    const application = await InfluencerApplication.findById(applicationId);
    if (!application) {
      res
        .status(404)
        .json({ success: false, message: 'Application not found' });
      return;
    }

    // @ts-ignore
    const userId = req.user?.userId;

    if (application.influencer.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this application',
      });
      return;
    }

    if (application.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Only pending applications can be deleted',
      });
      return;
    }

    await InfluencerApplication.findByIdAndDelete(applicationId);

    logger.info(`Application ${applicationId} deleted successfully`);
    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error: any) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function checkApplicationStatus(req: Request, res: Response) {
  try {
    const { campaignId } = req.params;
    // @ts-ignore
    const influencerId = req.user?.userId;

    if (!campaignId || !influencerId) {
      res.status(400).json({
        success: false,
        message: 'Campaign ID and user authentication are required',
      });
      return;
    }

    const application = await InfluencerApplication.findOne({
      campaign: campaignId,
      influencer: influencerId,
    });

    if (!application) {
      res.status(200).json({
        success: true,
        message: 'No application found',
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Application status retrieved successfully',
      data: {
        id: application._id,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (error: any) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllBrandCampaignsApplications(
  req: Request,
  res: Response
) {
  try {
    // @ts-ignore
    const { userId } = req.user;

    if (!userId) {
      res.status(403).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    let brandId = userId;
    if (!Types.ObjectId.isValid(userId)) {
      brandId = new Types.ObjectId(userId);
    }

    const campaigns = await Campaign.find({ business: brandId }).select('_id');

    if (!campaigns || campaigns.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No campaigns found for this brand',
        data: [],
      });
      return;
    }

    const campaignIds = campaigns.map((c) => c._id);

    const applications = await InfluencerApplication.find({
      campaign: { $in: campaignIds },
    })
      .populate('influencer', 'name email profilePicture socialMedia')
      .populate('campaign', 'title description image status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Campaign applications retrieved successfully',
      data: applications,
    });
  } catch (error: any) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCamapaignPerformance(req: Request, res: Response) {
  try {
    const { id: campaignId } = req.params;

    // Find the campaign to ensure it exists and check authorization
    const campaign = await Campaign.findById(campaignId).populate('product');
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    // @ts-ignore
    const userId = req.user?.userId;

    // Check if user is authorized to view this campaign's performance
    // Business owners can see their own campaigns, and influencers can see campaigns they've applied to
    // @ts-ignore
    const userType = req.user?.type;
    let isAuthorized = false;

    if (userType === 'business' && campaign.business.toString() === userId) {
      isAuthorized = true;
    } else if (userType === 'influencer') {
      const application = await InfluencerApplication.findOne({
        campaign: campaignId,
        influencer: userId,
        status: 'accepted',
      });
      isAuthorized = !!application;
    }

    if (!isAuthorized) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to view this campaign performance',
      });
      return;
    }

    // Find all accepted applications for this campaign
    const applications = await InfluencerApplication.find({
      campaign: campaignId,
      status: 'accepted',
    }).populate('influencer', 'name profilePicture');

    if (!applications || applications.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No accepted applications found for this campaign',
        data: {
          overall: {
            totalContents: 0,
            totalLikes: 0,
            totalComments: 0,
            totalViews: 0,
            totalShares: 0,
            totalReach: 0,
          },
          byInfluencer: [],
          byPlatform: [],
          historicalImpressions: [],
          salesSummary: {
            completed: { count: 0, amount: 0 },
            pending: { count: 0, amount: 0 },
            failed: { count: 0, amount: 0 },
          },
          payoutTracker: {
            paid: { count: 0, amount: 0 },
            pending: { count: 0, amount: 0 },
          },
          influencerPayouts: [],
        },
      });
      return;
    }

    // Find all content submissions for these applications
    const applicationIds = applications.map((app) => app._id);
    const contents = await CampaignContent.find({
      application: { $in: applicationIds },
      status: { $in: ['accepted', 'posted'] },
    }).populate({
      path: 'application',
      populate: {
        path: 'influencer',
        select: 'name profilePicture',
      },
    });

    // Get product sales data for this campaign's product
    const productSales = campaign.product
      ? await ProductSale.find({
          product:
            campaign.product instanceof Types.ObjectId
              ? campaign.product
              : (campaign.product as any)._id,
        })
      : [];

    // Initialize performance metrics
    let totalLikes = 0;
    let totalComments = 0;
    let totalViews = 0;
    let totalShares = 0;
    let totalReach = 0;

    // Metrics by platform
    const platformMetrics: Record<string, any> = {};

    // Metrics by influencer
    const influencerMetrics: Record<string, any> = {};

    // For historical impressions data (grouped by date) - store latest metric per day per post
    const metricsHistory = new Map<
      string,
      {
        interactions: number;
        likes: number;
        comments: number;
        views: number;
        shares: number;
        reach: number;
      }
    >();

    // Map to store the latest metric for each day for each post
    const dailyPostMetrics = new Map<string, Map<string, any>>();

    // Process all content submissions
    contents.forEach((content) => {
      // Process posts array which contains metrics
      if (content.posts && content.posts.length > 0) {
        content.posts.forEach(
          (post: { metrics: any[]; platform: string }, postIndex: number) => {
            // Process all metrics to build historical data
            if (post.metrics && post.metrics.length > 0) {
              // Group metrics by date and find the latest one for each date
              const metricsByDate = new Map<string, any[]>();

              post.metrics.forEach((metric: any) => {
                if (metric.fetchedAt) {
                  const dateKey = new Date(metric.fetchedAt)
                    .toISOString()
                    .split('T')[0];

                  if (!metricsByDate.has(dateKey)) {
                    metricsByDate.set(dateKey, []);
                  }
                  metricsByDate.get(dateKey)!.push(metric);
                }
              });

              // For each date, get the latest metric and store it
              metricsByDate.forEach((metrics, dateKey) => {
                // Sort metrics by fetchedAt to get the latest one
                const latestMetric = metrics.sort(
                  (a: any, b: any) =>
                    new Date(b.fetchedAt || 0).getTime() -
                    new Date(a.fetchedAt || 0).getTime()
                )[0];

                // Create unique key for this post on this date
                const postKey = `${content._id}_${postIndex}`;

                if (!dailyPostMetrics.has(dateKey)) {
                  dailyPostMetrics.set(dateKey, new Map());
                }

                dailyPostMetrics.get(dateKey)!.set(postKey, latestMetric);
              });
            }

            // Get the latest metrics for this post
            const latestMetrics =
              post.metrics && post.metrics.length > 0
                ? post.metrics.sort(
                    (a: any, b: any) =>
                      new Date(b.fetchedAt || 0).getTime() -
                      new Date(a.fetchedAt || 0).getTime()
                  )[0]
                : null;

            if (latestMetrics) {
              // Add to overall metrics
              totalLikes += latestMetrics.likes || 0;
              totalComments += latestMetrics.comments || 0;
              totalViews += latestMetrics.views || 0;
              totalShares += latestMetrics.shares || 0;
              totalReach += latestMetrics.reach || 0;

              // Add to platform metrics
              if (!platformMetrics[post.platform]) {
                platformMetrics[post.platform] = {
                  likes: 0,
                  comments: 0,
                  views: 0,
                  shares: 0,
                  reach: 0,
                  contentCount: 0,
                };
              }

              platformMetrics[post.platform].likes += latestMetrics.likes || 0;
              platformMetrics[post.platform].comments +=
                latestMetrics.comments || 0;
              platformMetrics[post.platform].views += latestMetrics.views || 0;
              platformMetrics[post.platform].shares +=
                latestMetrics.shares || 0;
              platformMetrics[post.platform].reach += latestMetrics.reach || 0;
              platformMetrics[post.platform].contentCount += 1;

              // Add to influencer metrics
              // Fix the TypeScript error by using type assertion for populated fields
              const applicationDoc = content.application as any; // Type assertion to handle populated fields
              const influencerId = applicationDoc?.influencer?._id?.toString();

              if (influencerId && !influencerMetrics[influencerId]) {
                const influencerName =
                  applicationDoc?.influencer?.name || 'Unknown';
                const profilePicture =
                  applicationDoc?.influencer?.profilePicture;

                influencerMetrics[influencerId] = {
                  influencerId,
                  name: influencerName,
                  profilePicture,
                  likes: 0,
                  comments: 0,
                  views: 0,
                  shares: 0,
                  reach: 0,
                  contentCount: 0,
                };
              }

              if (influencerId) {
                influencerMetrics[influencerId].likes +=
                  latestMetrics.likes || 0;
                influencerMetrics[influencerId].comments +=
                  latestMetrics.comments || 0;
                influencerMetrics[influencerId].views +=
                  latestMetrics.views || 0;
                influencerMetrics[influencerId].shares +=
                  latestMetrics.shares || 0;
                influencerMetrics[influencerId].reach +=
                  latestMetrics.reach || 0;
                influencerMetrics[influencerId].contentCount += 1;
              }
            }
          }
        );
      }
    });

    // Now aggregate the latest metrics for each day
    dailyPostMetrics.forEach((postsOnDate, dateKey) => {
      let dayTotalLikes = 0;
      let dayTotalComments = 0;
      let dayTotalViews = 0;
      let dayTotalShares = 0;
      let dayTotalReach = 0;

      // Sum up the latest metrics from all posts for this date
      postsOnDate.forEach((metric) => {
        dayTotalLikes += metric.likes || 0;
        dayTotalComments += metric.comments || 0;
        dayTotalViews += metric.views || 0;
        dayTotalShares += metric.shares || 0;
        dayTotalReach += metric.reach || 0;
      });

      // Calculate total interactions for this day
      const dayTotalInteractions =
        dayTotalLikes + dayTotalComments + dayTotalShares;

      // Store the aggregated metrics for this date
      metricsHistory.set(dateKey, {
        interactions: dayTotalInteractions,
        likes: dayTotalLikes,
        comments: dayTotalComments,
        views: dayTotalViews,
        shares: dayTotalShares,
        reach: dayTotalReach,
      });
    });

    // Convert historical data map to sorted array
    const historicalData = Array.from(metricsHistory.entries())
      .map(([date, metrics]) => ({
        date,
        interactions: metrics.interactions,
        likes: metrics.likes,
        comments: metrics.comments,
        views: metrics.views,
        shares: metrics.shares,
        reach: metrics.reach,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate sales summary
    const completedSales = productSales.filter(
      (sale) => sale.status === 'completed'
    );
    const pendingSales = productSales.filter(
      (sale) => sale.status === 'pending'
    );
    const failedSales = productSales.filter((sale) => sale.status === 'failed');

    const totalCompletedSalesAmount = completedSales.reduce(
      (total, sale) => total + (sale.amount || 0),
      0
    );
    const totalPendingSalesAmount = pendingSales.reduce(
      (total, sale) => total + (sale.amount || 0),
      0
    );
    const totalFailedSalesAmount = failedSales.reduce(
      (total, sale) => total + (sale.amount || 0),
      0
    );

    // Calculate influencer payouts
    const paidContents = contents.filter((content) => content.isPaid);
    const pendingContents = contents.filter(
      (content) => content.status === 'accepted' && !content.isPaid
    );

    // Process influencer payment data
    const influencerPayoutsMap = new Map();

    // Calculate payment amount for each influencer
    applications.forEach((app) => {
      // Use type assertion to handle populated fields
      const influencer = app.influencer as any;
      const influencerId = influencer?._id?.toString();
      if (!influencerId) return;

      // Determine payment amount - use negotiated price if available, otherwise use default (budget / number of influencers)
      const paymentAmount = app.price || campaign.budget / applications.length;

      if (!influencerPayoutsMap.has(influencerId)) {
        influencerPayoutsMap.set(influencerId, {
          influencerId,
          name: influencer?.name || 'Unknown',
          profilePicture: influencer?.profilePicture,
          applicationId: app._id,
          paymentAmount,
          // Check if this influencer has paid content
          isPaid: paidContents.some(
            (content) =>
              (content.application as any)?.influencer?._id?.toString() ===
              influencerId
          ),
        });
      }
    });

    // Convert to array
    const influencerPayouts = Array.from(influencerPayoutsMap.values());

    // Calculate totals for payout tracker
    const totalPaidAmount = paidContents.reduce((total, content) => {
      // Get the application for this content
      const app = applications.find(
        (a) =>
          a._id.toString() === (content.application as any)?._id?.toString()
      );
      // Use the payment amount from influencer payout or default amount
      return total + (app?.price || campaign.budget / applications.length);
    }, 0);

    const totalPendingAmount = pendingContents.reduce((total, content) => {
      // Get the application for this content
      const app = applications.find(
        (a) =>
          a._id.toString() === (content.application as any)?._id?.toString()
      );
      // Use the payment amount from influencer payout or default amount
      return total + (app?.price || campaign.budget / applications.length);
    }, 0);

    // Prepare the response data
    const performanceData = {
      overall: {
        totalContents: contents.length,
        totalLikes,
        totalComments,
        totalViews,
        totalShares,
        totalReach,
        engagementRate: calculateEngagementRate(
          totalLikes,
          totalComments,
          totalShares,
          totalReach
        ),
      },
      byInfluencer: Object.values(influencerMetrics).map((metrics) => {
        // Find the application for this influencer to get rating data
        const application = applications.find(
          (app) =>
            (app.influencer as any)?._id?.toString() === metrics.influencerId
        );

        return {
          ...metrics,
          engagementRate: calculateEngagementRate(
            metrics.likes,
            metrics.comments,
            metrics.shares,
            metrics.reach
          ),
          rating: application?.rating || null, // Include rating data if it exists
        };
      }),
      byPlatform: Object.entries(platformMetrics).map(
        ([platform, metrics]) => ({
          platform,
          ...metrics,
          engagementRate: calculateEngagementRate(
            metrics.likes,
            metrics.comments,
            metrics.shares,
            metrics.reach
          ),
        })
      ),
      historicalImpressions: historicalData,
      // Add sales summary data
      salesSummary: {
        completed: {
          count: completedSales.length,
          amount: totalCompletedSalesAmount,
        },
        pending: {
          count: pendingSales.length,
          amount: totalPendingSalesAmount,
        },
        failed: {
          count: failedSales.length,
          amount: totalFailedSalesAmount,
        },
        total: {
          count: productSales.length,
          amount:
            totalCompletedSalesAmount +
            totalPendingSalesAmount +
            totalFailedSalesAmount,
        },
      },
      // Add payout tracker data
      payoutTracker: {
        paid: {
          count: paidContents.length,
          amount: totalPaidAmount,
        },
        pending: {
          count: pendingContents.length,
          amount: totalPendingAmount,
        },
        total: {
          count: paidContents.length + pendingContents.length,
          amount: totalPaidAmount + totalPendingAmount,
        },
      },
      // Add influencer payout details
      influencerPayouts,
    };

    res.status(200).json({
      success: true,
      message: 'Campaign performance data retrieved successfully',
      data: performanceData,
    });
  } catch (error: any) {
    logger.error(`Error retrieving campaign performance: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
}

function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  reach: number
): number {
  if (!reach || reach === 0) return 0;
  return parseFloat((((likes + comments + shares) / reach) * 100).toFixed(2));
}

export async function generateThreeDProduct(req: Request, res: Response) {
  const { id: campaignId } = req.params;
  const { fileName } = req.body;
  if (!fileName || !campaignId) {
    res
      .status(400)
      .json({ success: false, message: 'File name and Campaign are required' });
    return;
  }
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }
    const campaignProduct = await Product.findById(campaign.product);
    const productFiles = campaignProduct?.images;
    const sourceFile = productFiles?.find(
      (file: any) => file.file === fileName
    );
    if (!sourceFile) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }
    const { localPath: threeDPath } = await generateGLBModelFromImage(
      path.join(__dirname, '..', '..', 'uploads', sourceFile.file)
    );
    sourceFile.three = threeDPath as string;
    await campaignProduct?.save();
    logger.info('3d', threeDPath);
    res.status(200).json({
      success: true,
      message: '3D model generated successfully',
      data: threeDPath,
    });
  } catch (err) {
    logger.error(err);
    res
      .status(500)
      .json({ success: false, message: 'Internal server error' + err });
  }
}

/**
 * Get all campaign invitations for an influencer
 * @route GET /campaign/invitations
 */
export async function getInfluencerCampaignInvitations(
  req: Request,
  res: Response
) {
  try {
    //@ts-ignore
    const influencerId = req.user?.userId;
    if (!influencerId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized request',
      });
      return;
    }

    const invitations = await CampaignInvitation.find({
      influencer: influencerId,
    })
      .populate({
        path: 'campaign',
        populate: {
          path: 'business',
          select: 'name profilePicture',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Campaign invitations retrieved successfully',
      data: invitations,
    });
  } catch (error) {
    logger.error(`Error getting campaign invitations: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving campaign invitations',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Respond to a campaign invitation (accept or reject)
 * @route PUT /campaign/invitation/:invitationId/respond
 */
export async function respondToCampaignInvitation(req: Request, res: Response) {
  try {
    const { invitationId } = req.params;
    const { response } = req.body;

    //@ts-ignore
    const influencerId = req.user?.userId;
    if (!influencerId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized request',
      });
      return;
    }

    if (!['accepted', 'rejected'].includes(response)) {
      res.status(400).json({
        success: false,
        message:
          'Invalid invitation response, must be "accepted" or "rejected"',
      });
      return;
    }

    // Find the invitation
    const invitation = await CampaignInvitation.findOne({
      _id: invitationId,
      influencer: influencerId,
    });

    if (!invitation) {
      res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
      return;
    }

    // Update invitation status
    invitation.status = response;
    await invitation.save();

    // If accepted, create an application automatically
    if (response === 'accepted') {
      const campaign = await Campaign.findById(invitation.campaign);
      if (!campaign) {
        res.status(404).json({
          success: false,
          message: 'Campaign not found',
        });
        return;
      }

      // Check if an application already exists
      const existingApplication = await InfluencerApplication.findOne({
        campaign: invitation.campaign,
        influencer: influencerId,
      });

      if (!existingApplication) {
        // Create a new application with accepted status
        const application = new InfluencerApplication({
          campaign: invitation.campaign,
          influencer: influencerId,
          status: 'accepted', // Automatically accepted since this is an invited influencer
          proposal: 'Invited by brand', // Default proposal for invitations
        });

        await application.save();

        // Create notification for the business
        await createNotification(
          campaign.business.toString(),
          'Campaign Invitation Accepted',
          `An influencer has accepted your invitation to the campaign "${campaign.name}"`,
          'campaign'
        );
      }
    } else if (response === 'rejected') {
      // Create notification for rejection
      const campaign = await Campaign.findById(invitation.campaign);
      if (campaign) {
        await createNotification(
          campaign.business.toString(),
          'Campaign Invitation Rejected',
          `An influencer has declined your invitation to the campaign "${campaign.name}"`,
          'campaign'
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Campaign invitation ${response} successfully`,
      data: invitation,
    });
  } catch (error) {
    logger.error(`Error responding to campaign invitation: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Error responding to campaign invitation',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export const getCampaignPerformanceStats = async (
  req: Request,
  res: Response
) => {
  try {
    //@ts-ignore
    const userId = req.user?.userId;

    // Get all campaigns for this brand
    const campaigns = await Campaign.find({ business: userId });
    const campaignIds = campaigns.map((campaign) => campaign._id);

    // Get all applications for these campaigns
    const applications = await InfluencerApplication.find({
      campaign: { $in: campaignIds },
    });

    // Get all content for these applications
    const contents = await CampaignContent.find({
      application: { $in: applications.map((app) => app._id) },
    });

    // Calculate financial statistics
    const stats = {
      totalRevenue: 0,
      pendingPayouts: 0,
      completedPayouts: 0,
      failedPayouts: 0,
      actionTypeSummary: {
        directCampaigns: 0,
        influencerCampaigns: 0,
        pendingCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        failedCampaigns: 0,
      },
    };

    // Calculate campaign status counts
    campaigns.forEach((campaign) => {
      // Check if campaign has accepted applications to determine if it's an influencer campaign
      const hasAcceptedApplications = applications.some(
        (app) =>
          app.campaign.toString() === campaign._id.toString() &&
          app.status === 'accepted'
      );

      if (campaign.status === 'pending') {
        stats.actionTypeSummary.pendingCampaigns++;
      } else if (campaign.status === 'review') {
        stats.actionTypeSummary.activeCampaigns++;
      } else if (campaign.status === 'closed') {
        stats.actionTypeSummary.completedCampaigns++;
      }

      // Count influencer vs direct campaigns based on accepted applications
      if (hasAcceptedApplications) {
        stats.actionTypeSummary.influencerCampaigns++;
      } else {
        stats.actionTypeSummary.directCampaigns++;
      }
    });

    // Calculate content-related statistics
    contents.forEach((content) => {
      if (content.isPaid) {
        const contentAmount = content.paymentRef ? 100 : 0; // Use paymentRef as a proxy for amount
        if (content.status === 'posted') {
          stats.totalRevenue += contentAmount;
          stats.completedPayouts += contentAmount;
        } else if (content.status === 'accepted') {
          stats.pendingPayouts += contentAmount;
        } else if (content.status === 'rejected') {
          stats.failedPayouts += contentAmount;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching campaign performance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign performance stats',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getBrandDashboardStats = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.user?.userId;

    // Get all campaigns for this brand
    const campaigns = await Campaign.find({ business: userId });
    const campaignIds = campaigns.map((campaign) => campaign._id);

    // Get all applications for these campaigns
    const applications = await InfluencerApplication.find({
      campaign: { $in: campaignIds },
      status: 'accepted',
    }).populate('campaign', 'budget');

    // Get all content for these applications
    const contents = await CampaignContent.find({
      application: { $in: applications.map((app) => app._id) },
      status: { $in: ['accepted', 'posted'] },
    });

    // Initialize aggregated metrics
    let totalReach = 0;
    let totalEngagement = 0; // likes + comments + shares
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalViews = 0;
    let contentCount = 0;

    // Aggregate metrics from all content posts
    contents.forEach((content) => {
      if (content.posts && content.posts.length > 0) {
        content.posts.forEach((post: any) => {
          if (post.metrics && post.metrics.length > 0) {
            // Get the latest metrics for this post
            const latestMetrics = post.metrics.sort(
              (a: any, b: any) =>
                new Date(b.fetchedAt || 0).getTime() -
                new Date(a.fetchedAt || 0).getTime()
            )[0];

            if (latestMetrics) {
              totalLikes += latestMetrics.likes || 0;
              totalComments += latestMetrics.comments || 0;
              totalShares += latestMetrics.shares || 0;
              totalViews += latestMetrics.views || 0;
              totalReach += latestMetrics.reach || 0;
              contentCount++;
            }
          }
        });
      }
    });

    // Calculate total engagement (likes + comments + shares)
    totalEngagement = totalLikes + totalComments + totalShares;

    // Calculate total campaign investment (sum of all campaign budgets)
    const totalInvestment = campaigns.reduce(
      (total, campaign) => total + (campaign.budget || 0),
      0
    );

    // Calculate payouts for completed content
    const paidContents = contents.filter((content) => content.isPaid);
    const totalPayouts = paidContents.reduce((total, content) => {
      // Find the corresponding application to get the negotiated price
      const application = applications.find(
        (app) => app._id.toString() === content.application.toString()
      );
      const campaignBudget = (application?.campaign as any)?.budget || 0;
      const paymentAmount =
        (application as any)?.price || campaignBudget / applications.length;
      return total + paymentAmount;
    }, 0);

    // Calculate ROI based on engagement value
    // Simple ROI calculation: (Total Engagement Value - Total Investment) / Total Investment
    // Assuming each engagement interaction has an estimated value
    const engagementValue = totalEngagement * 0.1; // $0.10 per engagement interaction
    const reachValue = totalReach * 0.01; // $0.01 per reach
    const totalValue = engagementValue + reachValue;
    const roi =
      totalInvestment > 0
        ? (totalValue - totalInvestment) / totalInvestment
        : 0;

    // Platform breakdown from content
    const platformStats: Record<
      string,
      { count: number; reach: number; engagement: number }
    > = {};
    contents.forEach((content) => {
      if (content.posts && content.posts.length > 0) {
        content.posts.forEach((post: any) => {
          if (!platformStats[post.platform]) {
            platformStats[post.platform] = {
              count: 0,
              reach: 0,
              engagement: 0,
            };
          }
          platformStats[post.platform].count++;

          if (post.metrics && post.metrics.length > 0) {
            const latestMetrics = post.metrics[post.metrics.length - 1];
            platformStats[post.platform].reach += latestMetrics.reach || 0;
            platformStats[post.platform].engagement +=
              (latestMetrics.likes || 0) +
              (latestMetrics.comments || 0) +
              (latestMetrics.shares || 0);
          }
        });
      }
    });

    // Convert platform stats to percentages based on engagement
    const totalPlatformEngagement = Object.values(platformStats).reduce(
      (sum, stats) => sum + stats.engagement,
      0
    );

    const platformPercentages = Object.entries(platformStats).map(
      ([platform, stats]) => ({
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        percentage:
          totalPlatformEngagement > 0
            ? Math.round((stats.engagement / totalPlatformEngagement) * 100)
            : 0,
        engagement: stats.engagement,
        reach: stats.reach,
        count: stats.count,
      })
    );

    // Campaign status summary
    const activeCampaigns = campaigns.filter(
      (c) => c.status === 'pending' || c.status === 'review'
    );
    const completedCampaigns = campaigns.filter((c) => c.status === 'closed');

    const dashboardStats = {
      totalReach,
      totalEngagement,
      estimatedROI: Math.max(roi, 0), // Don't show negative ROI
      totalCampaigns: campaigns.length,
      activeCampaigns: activeCampaigns.length,
      completedCampaigns: completedCampaigns.length,
      totalInvestment,
      totalPayouts,
      contentCount,
      platformStats: platformPercentages,
      metrics: {
        totalLikes,
        totalComments,
        totalShares,
        totalViews,
        engagementRate:
          totalReach > 0
            ? ((totalEngagement / totalReach) * 100).toFixed(2)
            : '0.00',
      },
    };

    res.status(200).json({
      success: true,
      data: dashboardStats,
    });
  } catch (error) {
    console.error('Error fetching brand dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brand dashboard stats',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export async function closeCampaign(req: Request, res: Response) {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user?.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Campaign ID is required',
      });
      return;
    }

    // Find the campaign
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
      return;
    }

    // Check if the user is the campaign owner (brand)
    if (campaign.business.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to close this campaign',
      });
      return;
    }

    // Check if campaign is already closed
    if (campaign.status === 'closed') {
      res.status(400).json({
        success: false,
        message: 'Campaign is already closed',
      });
      return;
    }

    // Update campaign status to closed
    campaign.status = 'closed';
    await campaign.save();

    logger.info(`Campaign ${id} closed by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Campaign closed successfully',
      data: campaign,
    });
  } catch (error: any) {
    logger.error(`Error closing campaign: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
