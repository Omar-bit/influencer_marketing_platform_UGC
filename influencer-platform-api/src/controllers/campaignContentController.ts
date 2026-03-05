import { Request, Response } from 'express';
import CampaignContent, { ICampaignContent } from '../models/campaignContent';
import InfluencerApplication from '../models/influencerApplication';
import Campaign from '../models/campaign';
import User from '../models/user';
import { postToInstagram } from '../services/instagramPublishingService';
import { uploadToCloudStorage } from '@services/cloudStorage';
import fs from 'fs';
import { postToSocialMedia } from '@services/socialMediaPosting';
import { createNotification } from './notificationController';
import logger from '@utils/logger';
import { getPaymentStatus, initiatePayment } from '@services/paymentService';
import {
  PAYMENT_CONTENT_REDIRECTION,
  PAYMENT_CONTENT_URL,
} from '@utils/constants';

export const submitCampaignContent = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.user?.userId;
    const { campaignId } = req.params;
    const { title, description, collaborator, tags, additionalNotes } =
      req.body;
    const files = req.files as Express.Multer.File[];

    const application = await InfluencerApplication.findOne({
      campaign: campaignId,
      influencer: userId,
      status: 'accepted',
    });

    if (!application) {
      res.status(403).json({
        message: 'You do not have an approved application for this campaign',
      });
      return;
    }

    const campaign = await Campaign.findById(application.campaign);
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }

    if (!files || files.length === 0) {
      res.status(400).json({ message: 'Content assets are required' });
      return;
    }
    const influencerContentForCampaign = await CampaignContent.findOne({
      application: application._id,
      status: { $in: ['accepted', 'posted'] },
    });
    if (influencerContentForCampaign) {
      res.status(400).json({
        message: 'You have already submitted content for this campaign',
      });
      return;
    }

    const cloudContentAssets: any = [];
    for (const file of files) {
      console.log('File deleted:', file);
      const readedFile = fs.readFileSync(file.path);
      const cloudFile = await uploadToCloudStorage(
        readedFile,
        file.originalname
      );
      cloudContentAssets.push(cloudFile);
      fs.unlinkSync(file.path);
    }

    const influencer = await User.findById(userId);
    if (!influencer) {
      res.status(404).json({ message: 'Influencer not found' });
      return;
    }

    const socialMediaPlatforms = campaign.platforms || [];
    for (const platform of socialMediaPlatforms) {
      const influencerPlatform = influencer.socialMedia.find(
        (p: { platform: string }) => p.platform === platform
      );
      if (!influencerPlatform) {
        socialMediaPlatforms.splice(socialMediaPlatforms.indexOf(platform), 1);
      }
    }

    // If product purchase is enabled and the influencer has a product URL code, append it to the description
    let finalDescription = description;
    if (campaign.enableProductPurchase && application.productUrlCode) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const productUrl = `${frontendUrl}/product/${application.productUrlCode}`;
      finalDescription = `${description}\n\nShop this product: ${productUrl}`;
    }

    const campaignContent = new CampaignContent({
      application: application._id,
      title,
      description: finalDescription,
      collaborator: collaborator || undefined,
      tags: tags || [],
      contentAssets: cloudContentAssets,
      additionalNotes: additionalNotes || undefined,
      socialMediaPlatforms: socialMediaPlatforms,
    });

    await campaignContent.save();

    res.status(201).json({
      message: 'Content submitted successfully',
      data: campaignContent,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: 'An error occurred while submitting content',
    });
  }
};

export const getCampaignContents = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    //@ts-ignore
    const userId = req.user?.userId;
    //@ts-ignore
    const role = req.user?.type;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }
    let contents: any[] = [];

    if (role === 'business') {
      if (campaign.business.toString() !== userId.toString()) {
        res.status(403).json({
          message: 'You do not have permission to view this campaign',
        });
        return;
      }

      const applications = await InfluencerApplication.find({
        campaign: campaignId,
        status: 'accepted',
      });

      contents = await CampaignContent.find({
        application: { $in: applications.map((app) => app._id) },
      }).populate({
        path: 'application',
        select: 'campaign',
        populate: [
          {
            path: 'influencer',
            select: 'name email profilePicture',
          },
          {
            path: 'campaign',
            select: 'image name description',
          },
        ],
      });
    }
    if (role === 'influencer') {
      const application = await InfluencerApplication.findOne({
        campaign: campaignId,
        influencer: userId,
        status: 'accepted',
      });

      if (!application) {
        res.status(404).json({ message: 'Application not found' });
        return;
      }

      contents = await CampaignContent.find({
        application: application._id,
      }).populate({
        path: 'application',
        select: 'campaign',
        populate: [
          {
            path: 'influencer',
            select: 'name email profilePicture',
          },
          {
            path: 'campaign',
            select: 'name description',
          },
        ],
      });
    }

    res.status(200).json({
      message: 'Campaign contents fetched successfully',
      data: contents,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching content submissions',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getCampaignContent = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.user?._id;
    //@ts-ignore
    const userType = req.user?.type;
    const { contentId } = req.params;

    const content = await CampaignContent.findById(contentId).populate({
      path: 'application',
      populate: [
        {
          path: 'influencer',
          select: 'name email profilePicture',
        },
        {
          path: 'campaign',
          select: 'name description',
        },
      ],
    });

    if (!content) {
      res.status(404).json({ message: 'Content submission not found' });
      return;
    }

    if (
      userType !== 'business' &&
      //@ts-ignore
      content.application.influencer._id.toString() !== userId.toString()
    ) {
      res
        .status(403)
        .json({ message: 'You do not have permission to view this content' });
      return;
    }

    res.status(200).json(content);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching content submission',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateContentStatus = async (req: Request, res: Response) => {
  try {
    console.log('update content status called');

    const { contentId } = req.params;
    const { status, reason } = req.body;
    //@ts-ignore
    const userId = req.user?.userId;

    const content = await CampaignContent.findById(contentId);
    if (!content) {
      res
        .status(404)
        .json({ message: 'Content submission not found', success: false });
      return;
    }
    if (['accepted', 'rejected'].indexOf(status) === -1) {
      res.status(400).json({ message: 'Invalid status', success: false });
      return;
    }
    const application = await InfluencerApplication.findById(
      content.application
    );
    if (!application) {
      res
        .status(404)
        .json({ message: 'Application not found', success: false });
      return;
    }
    const campaign = await Campaign.findById(application.campaign);
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found', success: false });
      return;
    }
    if (campaign.business.toString() !== userId.toString()) {
      res.status(403).json({
        message: 'You do not have permission to update this content status',
        success: false,
      });
      return;
    }
    const influencerContent = await CampaignContent.find({
      application: { $in: application._id },
      status: { $in: ['accepted', 'posted'] },
    });
    if (influencerContent.length > 0 && status === 'accepted') {
      //can't accept more than one content for the same campaign from the same influencer
      res.status(400).json({
        message:
          'This influencer has already submitted content for this campaign',
        success: false,
      });
      return;
    }

    content.status = status;
    if (status === 'rejected' && reason) {
      content.reason = reason;
    }

    // If the content is being accepted and product purchase is enabled, ensure the product URL is in the description
    if (
      status === 'accepted' &&
      campaign.enableProductPurchase &&
      application.productUrlCode
    ) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const productUrl = `${frontendUrl}/product/${application.productUrlCode}`;

      // Only append the product URL if it's not already in the description
      if (!content.description.includes(productUrl)) {
        content.description = `${content.description}\n\nShop this product: ${productUrl}`;
      }
    }

    await content.save();
    await createNotification(
      application.influencer.toString(),
      'Your content submission has been ' + status,
      'Your content submission has been ' + status,
      'campaign'
    );
    if (status === 'accepted' && content.isPaid === true) {
      const postingResult = await postToSocialMedia(content);
      content.status = 'posted';
      await content.save();
    }

    res.status(200).json({
      message: 'Content status updated successfully',
      data: content,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating content status',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAllCampaignContents = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.user?.userId;
    //@ts-ignore
    const userType = req.user?.type;

    let contents: any[] = [];

    if (userType === 'business') {
      // Business users should see contents for campaigns they own
      const businessCampaigns = await Campaign.find({ business: userId });

      if (!businessCampaigns.length) {
        res.status(200).json({
          success: true,
          message: 'No campaigns found for this business',
          data: [],
        });
        return;
      }

      const campaignIds = businessCampaigns.map((campaign) => campaign._id);

      const applications = await InfluencerApplication.find({
        campaign: { $in: campaignIds },
        status: 'accepted',
      });

      contents = await CampaignContent.find({
        application: { $in: applications.map((app) => app._id) },
      })
        .populate({
          path: 'application',
          populate: [
            {
              path: 'influencer',
              select: 'name email profilePicture',
            },
            {
              path: 'campaign',
              select: 'name description image',
            },
          ],
        })
        .sort({ createdAt: -1 });
    } else if (userType === 'influencer') {
      // Influencers should see their own content submissions
      const influencerApplications = await InfluencerApplication.find({
        influencer: userId,
        status: 'accepted',
      });

      contents = await CampaignContent.find({
        application: { $in: influencerApplications.map((app) => app._id) },
      })
        .populate({
          path: 'application',
          populate: [
            {
              path: 'influencer',
              select: 'name email profilePicture',
            },
            {
              path: 'campaign',
              select: 'name description image',
            },
          ],
        })
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      message: 'All campaign contents fetched successfully',
      success: true,
      data: contents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching campaign contents',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export async function payContent(req: Request, res: Response) {
  const { contentId } = req.params;
  // const { amount } = req.body;
  //@ts-ignore
  const userId = req.user?.userId;
  try {
    const content = await CampaignContent.findById(contentId);
    if (!content) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }
    const contentApplication = await InfluencerApplication.findById(
      content.application
    );
    if (!contentApplication) {
      res
        .status(404)
        .json({ success: false, message: 'Content application not found' });
      return;
    }
    const contentInfluencer = await User.findById(
      contentApplication.influencer
    );
    if (!contentInfluencer) {
      res.status(404).json({ success: false, message: 'Influencer not found' });
      return;
    }
    if (!contentInfluencer.walletId) {
      res.status(404).json({
        success: false,
        message: 'Influencer wallet not found',
      });
      return;
    }
    const contentCampaign = await Campaign.findById(
      contentApplication.campaign
    );
    if (!contentCampaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }
    if (contentCampaign.business.toString() !== userId.toString()) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to pay for this content',
      });
      return;
    }
    const brand = await User.findById(contentCampaign.business);
    if (!brand) {
      res.status(404).json({ success: false, message: 'Brand not found' });
      return;
    }

    if (content.status !== 'accepted') {
      res.status(400).json({
        success: false,
        message: 'Content is not accepted yet',
      });
      return;
    }
    if (content.isPaid) {
      res.status(400).json({
        success: false,
        message: 'Content is already paid',
      });
      return;
    }

    const influencerProposedPrice = contentApplication.price;

    const defaultPrice = contentCampaign.budget;
    const amount =
      influencerProposedPrice && influencerProposedPrice > defaultPrice
        ? influencerProposedPrice
        : defaultPrice;

    const paymentData = await initiatePayment(
      amount,
      brand.email,
      PAYMENT_CONTENT_URL + contentId,
      PAYMENT_CONTENT_URL + contentId,
      'Payment for campaign content ' + contentCampaign.name,
      contentInfluencer.walletId
    );
    content.paymentRef = paymentData?.data?.paymentRef;

    await content.save();
    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: paymentData,
    });
  } catch (err: any) {
    console.log(err);
    logger.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function handlePaymentStatus(req: Request, res: Response) {
  // /api/campaign/payment/6818f9dff31dc82002d67347?payment_ref=681c2a9683a36f0786e9e1f3
  const { payment_ref } = req.query;
  const { contentId } = req.params;
  if (!payment_ref) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
    return;
  }
  try {
    const content = await CampaignContent.findById(contentId);
    if (!content) {
      res.status(404).json({ success: false, message: 'Content not found' });
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

    content.paymentRef = payment_ref as string;
    content.isPaid = true;
    await content.save();

    //post content
    const postingResult = await postToSocialMedia(content);
    if (postingResult) {
      content.status = 'posted';
      await content.save();
    }

    const redirectionParams = new URLSearchParams({
      type: 'Content',
      paymentRef: payment_ref as string,
      contentId: contentId,
      status: 'success',
    });
    res
      .status(200)
      .redirect(
        PAYMENT_CONTENT_REDIRECTION + '?' + redirectionParams.toString()
      );
  } catch (err: any) {
    const redirectionParams = new URLSearchParams({
      type: 'Content',
      paymentRef: payment_ref as string,
      status: 'failed',
      contentId: contentId,
      error: err.message,
    });
    logger.error(err.message);
    res.redirect(
      PAYMENT_CONTENT_REDIRECTION + '?' + redirectionParams.toString()
    );
  }
}
