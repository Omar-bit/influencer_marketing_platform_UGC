import { Request, Response } from 'express';
import Ticket from '@models/ticket';
import User from '@models/user';
import { Types } from 'mongoose';
import logger from '@utils/logger';
import { createNotification } from './notificationController';

// Submit a new ticket
export async function createTicket(req: Request, res: Response) {
  try {
    const { type, title, description, priority } = req.body;

    // Validate required fields
    if (!title || !description) {
      res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
      return;
    }

    //@ts-ignore
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Create ticket
    const ticket = await Ticket.create({
      user: userId,
      type: type || 'question',
      title,
      description,
      priority: priority || 'medium',
      status: 'pending',
      read: false,
    });

    // Notify admins
    // This could be extended to notify admins via email or other means
    const admins = await User.find({ type: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'New Support Ticket',
        `A new ${ticket.type} ticket has been submitted: ${ticket.title}`,
        'system'
      );
    }

    res.status(201).json({
      success: true,
      message: 'Ticket submitted successfully',
      data: ticket,
    });
  } catch (error: any) {
    logger.error(`Error creating ticket: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while submitting the ticket',
    });
  }
}

// Get all tickets for the current user
export async function getUserTickets(req: Request, res: Response) {
  try {
    //@ts-ignore
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const tickets = await Ticket.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Tickets retrieved successfully',
      data: tickets,
    });
  } catch (error: any) {
    logger.error(`Error getting user tickets: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving tickets',
    });
  }
}

// Get a specific ticket by ID
export async function getTicketById(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;

    if (!Types.ObjectId.isValid(ticketId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid ticket ID',
      });
      return;
    }

    //@ts-ignore
    const userId = req.user?.userId;
    //@ts-ignore
    const userType = req.user?.type;

    const ticket: any = await Ticket.findById(ticketId).populate(
      'user',
      'name email profilePicture'
    );

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    // Only allow admins or the ticket owner to view the ticket
    if (userType !== 'admin' && ticket.user._id.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this ticket',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Ticket retrieved successfully',
      data: ticket,
    });
  } catch (error: any) {
    logger.error(`Error getting ticket: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the ticket',
    });
  }
}

// Get all tickets (admin only)
export async function getAllTickets(req: Request, res: Response) {
  try {
    //@ts-ignore
    const userType = req.user?.type;

    if (userType !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin privileges required.',
      });
      return;
    }

    // Support query parameters for filtering
    const { status, type, read } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (read !== undefined) filter.read = read === 'true';

    const tickets = await Ticket.find(filter)
      .populate('user', 'name email profilePicture type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Tickets retrieved successfully',
      data: tickets,
    });
  } catch (error: any) {
    logger.error(`Error getting all tickets: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving tickets',
    });
  }
}

// Update ticket status (admin only)
export async function updateTicketStatus(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;
    const { status, adminResponse } = req.body;

    if (!Types.ObjectId.isValid(ticketId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid ticket ID',
      });
      return;
    }

    //@ts-ignore
    const userType = req.user?.type;

    if (userType !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin privileges required.',
      });
      return;
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    // Update the ticket status
    ticket.status = status || ticket.status;

    // If admin provided a response, update it
    if (adminResponse) {
      ticket.adminResponse = adminResponse;
    }

    // Mark as read
    ticket.read = true;

    await ticket.save();

    // Notify the user about the status change
    await createNotification(
      ticket.user.toString(),
      'Ticket Status Updated',
      `Your ticket "${ticket.title}" has been ${
        ticket.status === 'resolved' ? 'resolved' : 'updated'
      }`,
      'system'
    );

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: ticket,
    });
  } catch (error: any) {
    logger.error(`Error updating ticket status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating ticket status',
    });
  }
}

// Mark ticket as read (admin only)
export async function markTicketAsRead(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;

    if (!Types.ObjectId.isValid(ticketId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid ticket ID',
      });
      return;
    }

    //@ts-ignore
    const userType = req.user?.type;

    if (userType !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin privileges required.',
      });
      return;
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { read: true },
      { new: true }
    );

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Ticket marked as read successfully',
      data: ticket,
    });
  } catch (error: any) {
    logger.error(`Error marking ticket as read: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while marking ticket as read',
    });
  }
}

// Mark all tickets as read (admin only)
export async function markAllTicketsAsRead(req: Request, res: Response) {
  try {
    //@ts-ignore
    const userType = req.user?.type;

    if (userType !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin privileges required.',
      });
      return;
    }

    await Ticket.updateMany({ read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: 'All tickets marked as read successfully',
    });
    return;
  } catch (error: any) {
    logger.error(`Error marking all tickets as read: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while marking tickets as read',
    });
  }
}

// Get ticket stats for admin dashboard
export async function getTicketStats(req: Request, res: Response) {
  try {
    //@ts-ignore
    const userType = req.user?.type;

    if (userType !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access. Admin privileges required.',
      });
      return;
    }

    const [totalTickets, pendingTickets, resolvedTickets, unreadTickets] =
      await Promise.all([
        Ticket.countDocuments(),
        Ticket.countDocuments({ status: 'pending' }),
        Ticket.countDocuments({ status: 'resolved' }),
        Ticket.countDocuments({ read: false }),
      ]);

    res.status(200).json({
      success: true,
      message: 'Ticket statistics retrieved successfully',
      data: {
        totalTickets,
        pendingTickets,
        resolvedTickets,
        unreadTickets,
      },
    });
  } catch (error: any) {
    logger.error(`Error getting ticket statistics: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving ticket statistics',
    });
  }
}
