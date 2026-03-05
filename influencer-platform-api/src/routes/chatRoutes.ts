import express from 'express';

import authMiddleware from '@middlewares/authMiddleware';
import {
  getChatRoomById,
  getChatRooms,
  getMessages,
  getUnreadCount,
  sendMessage,
} from '@conrollers/chatController';

const router = express.Router();

router.use(authMiddleware);

router.get('/rooms', getChatRooms);

router.get('/unread', getUnreadCount);

router.get('/rooms/:roomId', getChatRoomById);

router.get('/rooms/:roomId/messages', getMessages);

router.post('/rooms/:roomId/messages', sendMessage);

export default router;
