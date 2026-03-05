import { Request, Response } from 'express';
import ChatRoom from '@models/chatRoom';
import Message from '@models/message';
import mongoose from 'mongoose';
import logger from '@utils/logger';
import { createNotification } from '@controllers/notificationController';
import Campaign from '@models/campaign';
import InfluencerApplication from '@models/influencerApplication';

export async function getChatRooms(req: Request, res: Response) {
  try {
    // @ts-ignore
    const userId = req.user?.userId;

    if (!userId) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const chatRooms = await ChatRoom.find({
      $or: [{ brand: userId }, { influencer: userId }],
    })
      .populate('campaign', 'name image')
      .populate('brand', 'name profilePicture')
      .populate('influencer', 'name profilePicture')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: chatRooms,
    });
  } catch (error: any) {
    logger.error(`Error getting chat rooms: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getChatRoomById(req: Request, res: Response) {
  try {
    const { roomId } = req.params;
    // @ts-ignore
    const userId = req.user?.userId;

    if (!userId) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid room ID',
      });
      return;
    }

    const chatRoom = await ChatRoom.findOne({
      _id: roomId,
      $or: [{ brand: userId }, { influencer: userId }],
    })
      .populate('campaign', 'title image')
      .populate('brand', 'name profilePicture')
      .populate('influencer', 'name profilePicture');

    if (!chatRoom) {
      res.status(404).json({
        success: false,
        message: 'Chat room not found or you do not have access',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: chatRoom,
    });
  } catch (error: any) {
    logger.error(`Error getting chat room: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const { roomId } = req.params;
    // @ts-ignore
    const userId = req.user?.userId;
    const { page = 1, limit = 50 } = req.query;

    if (!userId) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid room ID',
      });
      return;
    }

    const chatRoom = await ChatRoom.findOne({
      _id: roomId,
      $or: [{ brand: userId }, { influencer: userId }],
    });

    if (!chatRoom) {
      res.status(404).json({
        success: false,
        message: 'Chat room not found or you do not have access',
      });
      return;
    }

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const messages = await Message.find({ chatRoom: roomId })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { chatRoom: roomId, sender: { $ne: userId }, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    logger.error(`Error getting messages: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    // @ts-ignore
    const userId = req.user?.userId;

    if (!userId) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const chatRooms = await ChatRoom.find({
      $or: [{ brand: userId }, { influencer: userId }],
    });

    const roomIds = chatRooms.map((room: any) => room._id);

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          chatRoom: { $in: roomIds },
          sender: { $ne: new mongoose.Types.ObjectId(userId) },
          read: false,
        },
      },
      {
        $group: {
          _id: '$chatRoom',
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadCountMap = unreadCounts.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    const totalUnread = unreadCounts.reduce(
      (sum: any, curr: any) => sum + curr.count,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        total: totalUnread,
        byRoom: unreadCountMap,
      },
    });
  } catch (error: any) {
    logger.error(`Error getting unread count: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const { roomId } = req.params;
    const { content, type = 'text', negotiation } = req.body;
    // @ts-ignore
    const userId = req.user?.userId;

    if (!userId) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!content) {
      res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid room ID',
      });
      return;
    }

    const chatRoom = await ChatRoom.findOne({
      _id: roomId,
      $or: [{ brand: userId }, { influencer: userId }],
    }).populate('campaign', 'name budget');

    if (!chatRoom) {
      res.status(404).json({
        success: false,
        message: 'Chat room not found or you do not have access',
      });
      return;
    }

    // Check if user is the influencer when sending a negotiation message
    if (type === 'negotiate' && userId !== chatRoom.influencer.toString()) {
      res.status(403).json({
        success: false,
        message: 'Only influencers can initiate price negotiations',
      });
      return;
    }

    // Check if user is the brand when sending a negotiation response
    if (type === 'negotiate_response' && userId !== chatRoom.brand.toString()) {
      res.status(403).json({
        success: false,
        message: 'Only brands can respond to price negotiations',
      });
      return;
    }

    // Create message object with basic properties
    const message = new Message({
      chatRoom: roomId,
      sender: userId,
      content,
      type,
    });

    // Add negotiation data if applicable
    if (
      (type === 'negotiate' || type === 'negotiate_response') &&
      negotiation
    ) {
      message.negotiation = {
        price: negotiation.price,
        reason: negotiation.reason,
        status: negotiation.status || 'pending',
      };
    }

    await message.save();

    // Update the chat room with the last message
    chatRoom.lastMessage =
      type === 'text' ? content : `[Price Negotiation] ${content}`;
    chatRoom.lastMessageTimestamp = new Date();
    await chatRoom.save();

    // If this is an accepted negotiation, update the application to reflect the negotiated price
    if (type === 'negotiate_response' && negotiation) {
      if (negotiation.status === 'accepted') {
        try {
          const application = await InfluencerApplication.findOne({
            _id: chatRoom.application,
          });

          if (application) {
            // Create or update the price field
            application.set('price', negotiation.price);
            await application.save();
            logger.info(
              `Updated application ${application._id} with price ${negotiation.price}`
            );
          }
        } catch (error) {
          logger.error(`Failed to update application with price: ${error}`);
        }
      } else {
        try {
          const application = await InfluencerApplication.findOne({
            _id: chatRoom.application,
          });

          if (application) {
            // Create or update the price field
            if (application.price === negotiation.price) {
              application.price = undefined;
            }
            await application.save();
            logger.info(
              `Updated application ${application._id} with declined price ${negotiation.price}`
            );
          }
        } catch (error) {
          logger.error(`Failed to update application with price: ${error}`);
        }
      }
    }

    try {
      const recipientId =
        userId === chatRoom.brand.toString()
          ? chatRoom.influencer.toString()
          : chatRoom.brand.toString();

      const notificationType =
        type === 'text' ? 'New Message Received' : 'Price Negotiation Update';
      const notificationMessage =
        type === 'text'
          ? `You have received a new message in your chat`
          : type === 'negotiate'
          ? `${chatRoom.campaign?.name}: The influencer has sent a price negotiation request`
          : `${chatRoom.campaign?.name}: The brand has responded to your price negotiation`;

      await createNotification(
        recipientId,
        notificationType,
        notificationMessage,
        'system'
      );
    } catch (error) {
      logger.error(`Failed to create notification for new message: ${error}`);
    }

    await message.populate('sender', 'name profilePicture');

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    logger.error(`Error sending message: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createChatRoom(
  applicationId: string,
  campaignId: string,
  brandId: string,
  influencerId: string
) {
  try {
    const existingChatRoom = await ChatRoom.findOne({
      application: applicationId,
    });

    if (existingChatRoom) {
      logger.info(`Chat room already exists for application ${applicationId}`);
      return existingChatRoom;
    }

    const chatRoom = new ChatRoom({
      campaign: campaignId,
      brand: brandId,
      influencer: influencerId,
      application: applicationId,
    });

    await chatRoom.save();
    logger.info(`Created chat room for application ${applicationId}`);

    return chatRoom;
  } catch (error: any) {
    logger.error(`Error creating chat room: ${error.message}`);
    throw new Error(`Failed to create chat room: ${error.message}`);
  }
}
