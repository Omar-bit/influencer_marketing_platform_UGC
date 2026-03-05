import { api } from '@/utils/axiosInstance';
import { CHAT_ROUTES } from '@/utils/api/routes/chat';

// Get all chat rooms for the current user
export async function getChatRooms() {
  try {
    const response = await api.get(CHAT_ROUTES.GET_ROOMS);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching chat rooms:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch chat rooms',
    };
  }
}

// Get a specific chat room by ID
export async function getChatRoomById(roomId: string) {
  try {
    const response = await api.get(`${CHAT_ROUTES.GET_ROOMS}/${roomId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching chat room:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch chat room',
    };
  }
}

// Get all messages in a chat room
export async function getMessages(
  roomId: string,
  page: number = 1,
  limit: number = 50
) {
  try {
    const response = await api.get(
      `${CHAT_ROUTES.GET_ROOMS}/${roomId}/messages`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch messages',
    };
  }
}

// Send a message in a chat room
export async function sendMessage(
  roomId: string,
  content: string,
  type: 'text' | 'negotiate' | 'negotiate_response' = 'text',
  negotiation?: {
    requestedPrice?: number;
    reason?: string;
    status?: 'pending' | 'accepted' | 'declined';
    originalPrice?: number;
  }
) {
  try {
    const payload = {
      content,
      type,
      negotiation:
        type !== 'text'
          ? {
              price: negotiation?.requestedPrice,
              reason: negotiation?.reason,
              status: negotiation?.status || 'pending',
            }
          : undefined,
    };

    const response = await api.post(
      `${CHAT_ROUTES.GET_ROOMS}/${roomId}/messages`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error('Error sending message:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send message',
    };
  }
}

// Get unread message count
export async function getUnreadCount() {
  try {
    const response = await api.get(CHAT_ROUTES.GET_UNREAD);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch unread count',
    };
  }
}
