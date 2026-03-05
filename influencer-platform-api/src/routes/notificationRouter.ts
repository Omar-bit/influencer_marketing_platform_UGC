import { Router } from 'express';
import * as notificationController from '@controllers/notificationController';
import authMiddleware from '@middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.getUserNotifications);

router.get('/unread-count', notificationController.getUnreadCount);

router.patch('/:id/read', notificationController.markAsRead);

router.patch('/read-all', notificationController.markAllAsRead);

router.delete('/:id', notificationController.deleteNotification);

export default router;
