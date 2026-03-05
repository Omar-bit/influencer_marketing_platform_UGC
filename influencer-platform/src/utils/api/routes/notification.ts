import {
  ApiResponse,
  NotificationData,
  NotificationCountResponse,
  NotificationListResponse,
} from '@/types/api';
import { api } from '@/utils/axiosInstance';

// Get user notifications
export const getUserNotifications = async (
  page = 1,
  limit = 10,
  unreadOnly = false
): Promise<NotificationListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    unreadOnly: unreadOnly.toString(),
  });

  const { data } = await api.get(`/notifications?${params.toString()}`);
  return data;
};

// Get unread notification count
export const getUnreadCount = async (): Promise<NotificationCountResponse> => {
  const { data } = await api.get(`/notifications/unread-count`);
  return data;
};

// Mark notification as read
export const markNotificationAsRead = async (
  id: string
): Promise<ApiResponse<NotificationData>> => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<
  ApiResponse<null>
> => {
  const { data } = await api.patch(`/notifications/read-all`);
  return data;
};

// Delete notification
export const deleteNotification = async (
  id: string
): Promise<ApiResponse<null>> => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};
