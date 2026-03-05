import * as ticketRoutes from '../routes/ticket';
import { api } from '@/utils/axiosInstance';

export type TicketType = 'question' | 'feedback' | 'bug' | 'feature' | 'other';
export type TicketStatus = 'pending' | 'inProgress' | 'resolved';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface TicketFormData {
  type: TicketType;
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface TicketStatusUpdate {
  status: TicketStatus;
  adminResponse?: string;
}

// Create a new ticket
export async function createTicket(formData: TicketFormData) {
  const { data } = await api.post(ticketRoutes.CREATE_TICKET, formData);
  return data;
}

// Get current user's tickets
export async function getUserTickets() {
  const { data } = await api.get(ticketRoutes.GET_USER_TICKETS);
  return data;
}

// Get a ticket by ID
export async function getTicketById(ticketId: string) {
  const { data } = await api.get(ticketRoutes.GET_TICKET_BY_ID(ticketId));
  return data;
}

// Admin: Get all tickets with optional filters
export async function getAllTickets(filters?: {
  status?: TicketStatus;
  type?: TicketType;
  read?: boolean;
}) {
  const queryParams = new URLSearchParams();

  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.type) queryParams.append('type', filters.type);
  if (filters?.read !== undefined)
    queryParams.append('read', filters.read.toString());

  const queryString = queryParams.toString();
  const url = queryString
    ? `${ticketRoutes.GET_ALL_TICKETS}?${queryString}`
    : ticketRoutes.GET_ALL_TICKETS;

  const { data } = await api.get(url);
  return data;
}

// Admin: Update ticket status
export async function updateTicketStatus(
  ticketId: string,
  update: TicketStatusUpdate
) {
  const { data } = await api.put(
    ticketRoutes.UPDATE_TICKET_STATUS(ticketId),
    update
  );
  return data;
}

// Admin: Mark ticket as read
export async function markTicketAsRead(ticketId: string) {
  const { data } = await api.patch(ticketRoutes.MARK_TICKET_AS_READ(ticketId));
  return data;
}

// Admin: Mark all tickets as read
export async function markAllTicketsAsRead() {
  const { data } = await api.patch(ticketRoutes.MARK_ALL_TICKETS_AS_READ);
  return data;
}

// Admin: Get ticket statistics for dashboard
export async function getTicketStats() {
  const { data } = await api.get(ticketRoutes.GET_TICKET_STATS);
  return data;
}
