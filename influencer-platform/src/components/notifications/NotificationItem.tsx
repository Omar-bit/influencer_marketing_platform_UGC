import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MdCampaign, MdPayment, MdInfo } from 'react-icons/md';
import { NotificationData } from '@/types/api';
import {
  markNotificationAsRead,
  deleteNotification,
} from '@/utils/api/routes/notification';
import { useNotifications } from '@/providers/NotificationProvider';

interface NotificationItemProps {
  notification: NotificationData;
  onReadStateChange: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onReadStateChange,
}) => {
  const { refreshNotifications } = useNotifications();

  const renderIcon = () => {
    switch (notification.type) {
      case 'campaign':
        return <MdCampaign className='h-4 w-4 text-blue-500' />;
      case 'payment':
        return <MdPayment className='h-4 w-4 text-green-500' />;
      default:
        return <MdInfo className='h-4 w-4 text-gray-500' />;
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification._id);
        onReadStateChange();
        refreshNotifications(); // Refresh notifications globally
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(notification._id);
      onReadStateChange();
      refreshNotifications(); // Refresh notifications globally
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div
      className={`p-3 border-b border-gray-200 dark:border-gray-700 flex items-start gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={handleMarkAsRead}
    >
      <div className='flex-shrink-0 mt-1'>{renderIcon()}</div>
      <div className='flex-grow min-w-0'>
        <h4 className='font-medium text-sm text-gray-900 dark:text-white truncate'>
          {notification.title}
        </h4>
        <p className='text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2'>
          {notification.body}
        </p>
        <div className='flex items-center justify-between mt-2'>
          <p className='text-[10px] text-gray-500 dark:text-gray-400'>
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
          <div className='flex items-center gap-2'>
            {!notification.read && (
              <button
                onClick={handleMarkAsRead}
                className='text-[10px] text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Mark read
              </button>
            )}
            <button
              onClick={handleDelete}
              className='text-[10px] text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-1'
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
