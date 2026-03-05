import { Request, Response } from 'express';
import User from '@models/user';
import { Types } from 'mongoose';

export const addBookmark = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.body;
    //@ts-ignore
    const userId = req.user?.userId;
    if (!campaignId) {
      res.status(400).json({ message: 'Campaign ID is required' });
      return;
    }

    if (!Types.ObjectId.isValid(campaignId)) {
      res.status(400).json({ message: 'Invalid campaign ID format' });
      return;
    }

    const updatedUser = await User.findById(userId);
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const bookmarkedCampaigns = updatedUser.bookmarkedCampaigns || [];
    if (bookmarkedCampaigns.includes(campaignId)) {
      res.status(400).json({ message: 'Campaign already bookmarked' });
      return;
    }
    bookmarkedCampaigns.push(campaignId);
    updatedUser.bookmarkedCampaigns = bookmarkedCampaigns;
    await updatedUser.save();

    res.status(200).json({
      message: 'Campaign bookmarked successfully',
      data: updatedUser.bookmarkedCampaigns,
      success: true,
    });
    return;
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export const removeBookmark = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    //@ts-ignore
    const userId = req.user?.userId;
    if (!Types.ObjectId.isValid(campaignId)) {
      res.status(400).json({ message: 'Invalid campaign ID format' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { bookmarkedCampaigns: campaignId } },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Campaign removed from bookmarks',
      bookmarks: updatedUser.bookmarkedCampaigns,
      success: true,
    });
    return;
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export const getBookmarks = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.user?.userId;
    const user = await User.findById(userId).populate('bookmarkedCampaigns');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      data: user.bookmarkedCampaigns || [],
      success: true,
      message: 'Bookmarks retrieved successfully',
    });
    return;
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export const checkBookmark = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    //@ts-ignore
    const userId = req.user?.userId;
    if (!Types.ObjectId.isValid(campaignId)) {
      res.status(400).json({ message: 'Invalid campaign ID format' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isBookmarked = user.bookmarkedCampaigns?.some(
      (id: Types.ObjectId | string) => id.toString() === campaignId
    );

    res.status(200).json({ isBookmarked });
    return;
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};
