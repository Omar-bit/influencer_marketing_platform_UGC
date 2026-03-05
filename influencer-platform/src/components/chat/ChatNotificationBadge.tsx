'use client';

import { useEffect, useState } from 'react';
import { getUnreadCount } from '@/utils/api/handlers/chat';
import { useSocket } from '@/providers/SocketProvider';

interface ChatNotificationBadgeProps {
  className?: string;
}

export default function ChatNotificationBadge({
  className = '',
}: ChatNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    fetchUnreadCount();

    if (socket && isConnected) {
      socket.on('receive-message', () => {
        fetchUnreadCount();
      });

      return () => {
        socket.off('receive-message');
      };
    }
  }, [socket, isConnected]);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.total);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 ${className}`}
    >
      {unreadCount > 9 ? '9+' : unreadCount}
    </div>
  );
}
