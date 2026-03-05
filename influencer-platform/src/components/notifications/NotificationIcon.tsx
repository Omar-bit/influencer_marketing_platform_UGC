import React, { useEffect, useState } from 'react';
import { IoMdNotifications } from 'react-icons/io';
import { getUnreadCount } from '@/utils/api/routes/notification';
import { useNotifications } from '@/providers/NotificationProvider';

interface NotificationIconProps {
  onClick?: () => void;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { lastRefreshed } = useNotifications();

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [lastRefreshed]);

  return (
    <button
      onClick={onClick}
      className='relative flex items-center justify-center focus:outline-none'
      aria-label='Notifications'
    >
      <IoMdNotifications className='h-5 w-5 text-brand-primary dark:text-gray-300 hover:text-brand-primary dark:hover:text-white' />

      {unreadCount > 0 && (
        <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white'>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationIcon;
