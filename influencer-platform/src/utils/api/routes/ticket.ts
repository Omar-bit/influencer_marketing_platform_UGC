const root = '/tickets';

// User endpoints
export const CREATE_TICKET = `${root}`;
export const GET_USER_TICKETS = `${root}/user`;
export const GET_TICKET_BY_ID = (ticketId: string) => `${root}/${ticketId}`;

// Admin endpoints
export const GET_ALL_TICKETS = `${root}`;
export const UPDATE_TICKET_STATUS = (ticketId: string) => `${root}/${ticketId}/status`;
export const MARK_TICKET_AS_READ = (ticketId: string) => `${root}/${ticketId}/read`;
export const MARK_ALL_TICKETS_AS_READ = `${root}/read-all`;
export const GET_TICKET_STATS = `${root}/stats/dashboard`;
