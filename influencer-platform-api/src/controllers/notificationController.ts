import { Request, Response } from 'express';
import Notification, { INotification } from '@models/notification';
import { Types } from 'mongoose';

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.user?.userId;
    const { page = 1, limit = 10, unreadOnly = false } = req.query;

    const query: any = { user: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: { createdAt: -1 },
    };

    const notifications = await Notification.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort({ createdAt: 'desc' });

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: (error as Error).message,
    });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.user?.userId;
    const count = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notifications count',
      error: (error as Error).message,
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    //@ts-ignore
    const userId = req.user?.userId;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: (error as Error).message,
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.user?.userId;

    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: (error as Error).message,
    });
  }
};

export const createNotification = async (
  userId: Types.ObjectId | string,
  title: string,
  body: string,
  type: INotification['type'] = 'system'
) => {
  try {
    const notification = new Notification({
      user: userId,
      title,
      body,
      type,
      read: false,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    //@ts-ignore
    const userId = req.user?.userId;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
      return;
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: (error as Error).message,
    });
  }
};
