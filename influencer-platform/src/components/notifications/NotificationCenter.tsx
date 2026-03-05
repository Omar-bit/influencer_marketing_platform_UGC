import React from 'react';
import { useRouter } from 'next/navigation';
import NotificationIcon from './NotificationIcon';

const NotificationCenter: React.FC = () => {
  const router = useRouter();

  const navigateToNotificationsPage = () => {
    router.push('/notifications');
  };

  return (
    <div className='relative'>
      <NotificationIcon onClick={navigateToNotificationsPage} />
    </div>
  );
};

export default NotificationCenter;
