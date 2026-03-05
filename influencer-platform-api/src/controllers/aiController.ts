// filepath: c:\Users\bouas\code\webtrend\influencer-platform\influencer-platform-api\src\controllers\aiController.ts
import { Request, Response } from 'express';
import {
  generateProposal,
  generateContentSuggestions,
} from '../services/aiService';
import Campaign from '@models/campaign';
import InfluencerApplication from '@models/influencerApplication';
import { Product } from '@models/product';

export const generateAIProposal = async (req: Request, res: Response) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !description) {
      res.status(400).json({
        success: false,
        message: 'Campaign name and description are required',
      });
      return;
    }

    const proposal = await generateProposal(name, description, category);

    res.status(200).json({
      success: true,
      data: proposal,
    });
    return;
  } catch (error: any) {
    console.error('Error generating AI proposal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate AI proposal',
    });
    return;
  }
};

export const generateContentSuggestionsForApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const { applicationId } = req.params;

    // @ts-ignore
    const influencerId = req.user?.userId;

    if (!applicationId || !influencerId) {
      res.status(400).json({
        success: false,
        message: 'Application ID and user authentication are required',
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

    if (application.influencer.toString() !== influencerId) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to access this application',
      });
      return;
    }

    if (application.status !== 'accepted') {
      res.status(400).json({
        success: false,
        message:
          'Content suggestions are only available for accepted applications',
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
    const product = await Product.findById(campaign.product);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }
    const productDetails = product
      ? {
          // @ts-ignore
          name: product.name,
          // @ts-ignore
          description: product.description,
          // @ts-ignore
          price: product.price,
          // @ts-ignore
          category: product.category,
        }
      : undefined;

    const suggestions = await generateContentSuggestions(
      campaign.name,
      campaign.description,
      campaign.contentRequirements,
      campaign.platforms,
      campaign.ecommerceCategory,
      productDetails
    );

    res.status(200).json({
      success: true,
      data: suggestions,
    });
    return;
  } catch (error: any) {
    console.error('Error generating content suggestions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate content suggestions',
    });
    return;
  }
};
