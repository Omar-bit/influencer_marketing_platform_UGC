'use client';
import React, { useState } from 'react';
import NotificationIcon from '@/assets/notification.svg';
import { useSession } from 'next-auth/react';
import ProfilePicture from '../shared/ProfilePicture/ProfilePicture';

function LayoutHeader() {
  const [search, setSearch] = useState('');
  const { data: session } = useSession();
  //@ts-ignore
  let profilePicture = session?.user?.profilePicture;
  if (profilePicture) {
    profilePicture = `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${profilePicture}`;
  }

  return (
    <header className='flex flex-col sm:flex-row items-center justify-between px-3 sm:px-5 py-2 shadow gap-2'>
      <div className='relative w-full sm:w-[50%] order-2 sm:order-1'>
        <input
          type='text'
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          placeholder='Search'
          className='border border-purple-800 w-full rounded-full px-5 py-2'
        />
        <button className='w-7 h-6 rounded-full bg-purple-800 absolute right-3 top-1/2 -translate-y-1/2'></button>
      </div>

      <div className='w-full sm:w-auto flex items-center justify-end gap-2 sm:gap-4 order-1 sm:order-2'>
        <NotificationIcon className='size-5 sm:size-6' />
        {/* <div className='bg-gray-600 rounded-full size-10 sm:size-12' /> */}
        <ProfilePicture alt='profile picture' src={profilePicture} />
        <p className='text-gray-600 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none'>
          {session?.user?.name}
        </p>
      </div>
    </header>
  );
}

export default LayoutHeader;
