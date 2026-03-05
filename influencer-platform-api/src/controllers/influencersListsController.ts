import InfluencersLists from '@models/influencersLists';
import User from '@models/user';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
export const createInfluencersList = async (req: Request, res: Response) => {
  try {
    const { influencers, name } = req.body;
    //@ts-ignore
    const userId = req?.user?.userId;

    if (!userId || !influencers || !name) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const newList = await InfluencersLists.create({
      businessId: userId,
      influencers,
      name,
    });

    res.status(201).json(newList);
    return;
  } catch (error) {
    console.error('Error creating influencers list:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export const getInfluencersLists = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    //@ts-ignore
    const userId = req?.user?.userId;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Brand ID is required' });
      return;
    }
    if (userId !== businessId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const lists = await InfluencersLists.find({ businessId }).populate(
      'influencers',
      'name email profilePicture'
    );

    res.status(200).json({ success: true, data: lists });
    return;
  } catch (error) {
    console.error('Error fetching influencers lists:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
    return;
  }
};

export const getInfluencersListById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid list ID' });
      return;
    }

    const list = await InfluencersLists.findById(id).populate(
      'influencers',
      'name email profilePicture'
    );

    if (!list) {
      res.status(404).json({ message: 'Influencers list not found' });
      return;
    }

    res.status(200).json(list);
    return;
  } catch (error) {
    console.error('Error fetching influencer list:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export const updateInfluencersList = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req?.user?.userId;
    const { id } = req.params;
    const { influencers, name } = req.body;

    if (!influencers && !name) {
      res.status(400).json({ message: 'Nothing to update' });
      return;
    }
    const list = await InfluencersLists.findById(id);
    if (!list) {
      res.status(404).json({ message: 'Influencers list not found' });
      return;
    }
    if (list.businessId.toString() !== userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const updateData: any = {};
    if (name) {
      updateData.name = name;
    }
    if (influencers) {
      updateData.influencers = influencers;
    }

    const updatedList = await InfluencersLists.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedList) {
      res
        .status(404)
        .json({ success: false, message: 'Influencers list not found' });
      return;
    }

    res.status(200).json(updatedList);
    return;
  } catch (error) {
    console.error('Error updating influencer list:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export const deleteInfluencersList = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req?.user?.userId;
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid list ID' });
      return;
    }
    const list = await InfluencersLists.findById(id);
    if (list?.businessId.toString() !== userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }
    const deletedList = await InfluencersLists.findByIdAndDelete(id);

    res.status(200).json({ message: 'Influencers list deleted successfully' });
    return;
  } catch (error) {
    console.error('Error deleting influencer list:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export const addMembersToList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { influencers } = req.body;

    if (!influencers || influencers.length === 0) {
      res.status(400).json({ message: 'No influencers provided' });
      return;
    }

    const list = await InfluencersLists.findById(id);
    if (!list) {
      res.status(404).json({ message: 'Influencers list not found' });
      return;
    }

    //@ts-ignore
    const userId = req?.user?.userId;
    if (list.businessId.toString() !== userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const uniqueInfluencers = [
      ...new Set([
        ...list.influencers.map((influencer: any) => influencer.toString()),
        ...influencers.map((influencer: any) => influencer.toString()),
      ]),
    ];
    list.influencers = uniqueInfluencers;
    await list.save();

    res
      .status(200)
      .json({ data: list, message: 'Influencers added to list successfully' });
  } catch (error) {
    console.error('Error adding members to influencers list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
