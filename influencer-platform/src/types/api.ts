export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface NotificationData {
  _id: string;
  user: string;
  title: string;
  body: string;
  read: boolean;
  type: 'system' | 'campaign' | 'payment';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse
  extends ApiResponse<NotificationData[]> {
  pagination?: PaginationData;
}

export interface NotificationCountResponse extends ApiResponse<null> {
  count: number;
}
