'use client';

import React, { useEffect, useState } from 'react';
import {
  getUserNotifications,
  markAllNotificationsAsRead,
} from '@/utils/api/routes/notification';
import { NotificationData } from '@/types/api';
import NotificationItem from '@/components/notifications/NotificationItem';
import Button from '@/components/ui/button';
import { useNotifications } from '@/providers/NotificationProvider';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { refreshNotifications } = useNotifications();

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await getUserNotifications(pageNum, 10);
      console.log('Notifications response:', response);

      if (response.success && response.data) {
        if (append) {
          //@ts-ignore
          setNotifications((prev) => [...prev, ...response.data]);
        } else {
          setNotifications(response.data);
        }

        // Check if there are more pages
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
      // Refresh notifications
      fetchNotifications();
      refreshNotifications(); // Update notification count in the badge
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationChange = () => {
    // Refresh notifications after an action (mark as read or delete)
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className='container w-full mx-auto py-8 px-4 md:px-0'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
          Notifications
        </h1>
        <Button
          onClick={handleMarkAllAsRead}
          variant='outlined'
          disabled={notifications.length === 0}
        >
          Mark all as read
        </Button>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-lg shadow'>
        {loading && notifications.length === 0 ? (
          <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
            You don't have any notifications yet.
          </div>
        ) : (
          <div className='divide-y divide-gray-200 dark:divide-gray-700'>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onReadStateChange={handleNotificationChange}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div className='p-4 text-center'>
            <Button onClick={handleLoadMore} variant='ghost' disabled={loading}>
              {loading ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
