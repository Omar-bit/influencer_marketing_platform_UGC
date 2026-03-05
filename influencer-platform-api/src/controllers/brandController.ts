import { Request, Response } from 'express';
import User, { IUser } from '../models/user';

import mongoose from 'mongoose';
import { getTotalRemainingCampaigns } from './subscriptionController';

export const getBrandProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
      return;
    }

    const user = await User.findOne({
      _id: id,
      type: 'business',
    }).select('-password -failedAttempts -lockUntil -passKey -otpCode');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Error getting brand profile:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBrandProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    let updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
      return;
    }

    const profilePicture = files?.profilePicture?.[0]?.filename;

    const portfolioImage = files?.portfolioImage?.[0]?.filename;
    const user = await User.findOne({ _id: id, type: 'business' });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
      return;
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

    if (typeof updateData.address === 'string') {
      updateData.address = JSON.parse(updateData.address);
    }

    if (typeof updateData.secondaryNiches === 'string') {
      updateData.secondaryNiches = JSON.parse(updateData.secondaryNiches);
    }

    if (typeof updateData.portfolio === 'string') {
      updateData.portfolio = JSON.parse(updateData.portfolio);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -failedAttempts -lockUntil -passKey -otpCode');

    res.status(200).json({
      success: true,
      message: 'Brand profile updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating brand profile:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteBrandAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
      return;
    }

    const user = await User.findOne({ _id: id, type: 'business' });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
      return;
    }

    // Delete profile picture if exists
    // if (user.profilePicture) {
    //   await deleteFile(user.profilePicture);
    // }

    // // Delete portfolio images if any
    // if (user.portfolio && user.portfolio.length > 0) {
    //   for (const image of user.portfolio) {
    //     await deleteFile(image);
    //   }
    // }

    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Brand account deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting brand account:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export async function getBrandRemainingCampaigns(req: Request, res: Response) {
  //@ts-ignore
  const id = req?.user?.userId;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
      return;
    }

    const remainingCampaigns = await getTotalRemainingCampaigns(id);
    res.status(200).json({
      success: true,
      data: remainingCampaigns,
    });
  } catch (error: any) {
    console.error('Error getting brand remaining campaigns:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
