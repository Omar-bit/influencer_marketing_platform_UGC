import { Router } from 'express';
import * as ticketController from '@controllers/ticketController';
import authMiddleware from '@middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// User accessible routes
router.post('/', ticketController.createTicket);
router.get('/user', ticketController.getUserTickets);
router.get('/:ticketId', ticketController.getTicketById);

// Admin only routes
router.get('/', ticketController.getAllTickets);
router.put('/:ticketId/status', ticketController.updateTicketStatus);
router.patch('/:ticketId/read', ticketController.markTicketAsRead);
router.patch('/read-all', ticketController.markAllTicketsAsRead);
router.get('/stats/dashboard', ticketController.getTicketStats);

export default router;
