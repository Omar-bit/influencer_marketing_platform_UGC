import React, { useEffect, useState, useRef } from 'react';
import {
  getUserNotifications,
  markAllNotificationsAsRead,
} from '@/utils/api/routes/notification';
import { NotificationData } from '@/types/api';
import NotificationItem from './NotificationItem';
import Button from '../ui/button';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await getUserNotifications(pageNum, 10);

      if (response.success && response.data) {
        if (append) {
          //@ts-ignore
          setNotifications((prev) => [...prev, ...response.data]);
        } else {
          setNotifications(response.data);
        }

        setHasMore(
          response.pagination
            ? response.pagination.page < response.pagination.pages
            : false
        );
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationChange = () => {
    fetchNotifications();
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      setPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className='absolute bottom-16 md:-right-16 lg:right-0 w-72 md:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-[70vh] flex flex-col'
      style={{ transform: 'translateX(-25%)' }}
    >
      <div className='p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center'>
        <h3 className='font-medium text-base text-gray-900 dark:text-white'>
          Notifications
        </h3>
        <Button
          onClick={handleMarkAllAsRead}
          variant='outlined'
          className='text-xs px-2 py-1 h-auto'
        >
          Mark all as read
        </Button>
      </div>

      <div className='overflow-y-auto flex-grow'>
        {notifications.length === 0 ? (
          <div className='p-4 text-center text-gray-500 dark:text-gray-400'>
            {loading ? 'Loading notifications...' : 'No notifications'}
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onReadStateChange={handleNotificationChange}
              />
            ))}

            {hasMore && (
              <div className='p-2 text-center'>
                <Button
                  onClick={handleLoadMore}
                  variant='ghost'
                  disabled={loading}
                  className='text-xs w-full'
                >
                  {loading ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
