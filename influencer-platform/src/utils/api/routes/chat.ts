const root = '/chat';

export const CHAT_ROUTES = {
  GET_ROOMS: `${root}/rooms`,
  GET_UNREAD: `${root}/unread`,
};

// Get all chat rooms
export const GET_CHAT_ROOMS = `${root}`;

// Get unread message count
export const GET_UNREAD_COUNT = `${root}/unread`;

// Get a specific chat room
export const GET_CHAT_ROOM = (roomId: string) => `${root}/${roomId}`;

// Get messages for a chat room
export const GET_MESSAGES = (roomId: string) => `${root}/${roomId}/messages`;

// Send a message in a chat room
export const SEND_MESSAGE = (roomId: string) => `${root}/${roomId}/messages`;
