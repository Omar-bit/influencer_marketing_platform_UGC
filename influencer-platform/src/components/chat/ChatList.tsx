'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { getChatRooms } from '@/utils/api/handlers/chat';
import Link from 'next/link';
import { BACKEND_URL } from '@/utils/secrets';
import ProfilePicture from '../shared/ProfilePicture/ProfilePicture';
import { DEFAULT_CAMPAIGN_IMAGE } from '@/utils/constants';
import Image from 'next/image';

interface ChatRoom {
  _id: string;
  campaign: {
    _id: string;
    name: string;
    image?: string;
  };
  brand: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  influencer: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  lastMessage: string;
  lastMessageTimestamp: string;
}

export default function ChatList() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchChatRooms() {
      try {
        setLoading(true);
        const response = await getChatRooms();
        if (response.success) {
          setChatRooms(response.data);
        } else {
          setError('Failed to load chat rooms');
        }
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
        setError('An error occurred while loading chat rooms');
      } finally {
        setLoading(false);
      }
    }

    fetchChatRooms();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary'></div>
      </div>
    );
  }

  if (error) {
    return <div className='text-red-500 text-center py-4'>{error}</div>;
  }

  if (chatRooms.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
        <p className='mb-2'>No conversations yet</p>
        <p className='text-sm'>
          When you accept an application, a chat will be created here
        </p>
      </div>
    );
  }
  console.log(chatRooms);

  return (
    <div className='divide-y divide-gray-200 dark:divide-gray-700'>
      {chatRooms.map((room) => (
        <Link
          href={`/chat/${room._id}`}
          key={room._id}
          className='flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
        >
          <div className='relative flex-shrink-0'>
            {room.campaign?.image ? (
              <img
                src={`${BACKEND_URL}/uploads/${room.campaign.image}`}
                alt={room.campaign.name}
                className='w-12 h-12 rounded-full object-cover'
              />
            ) : (
              <Image
                src={DEFAULT_CAMPAIGN_IMAGE}
                alt='Default Campaign'
                className='w-12 h-12 rounded-full object-cover'
              />
            )}
          </div>

          <div className='ml-4 flex-1 min-w-0'>
            <div className='flex justify-between items-baseline'>
              <h4 className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                {room?.campaign?.name}
              </h4>
              {room.lastMessageTimestamp && (
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  {formatDistanceToNow(new Date(room.lastMessageTimestamp), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>

            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400 truncate'>
              {room.lastMessage || 'No messages yet'}
            </p>

            <div className='mt-1 flex items-center'>
              <ProfilePicture
                src={
                  room.brand.profilePicture
                    ? `${BACKEND_URL}/uploads/${room.brand.profilePicture}`
                    : ''
                }
                alt={room.brand.name}
                size='small'
                className={{ container: 'w-4 h-4 mr-1' }}
              />
              <span className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                {room.brand.name}
              </span>

              <span className='mx-1 text-gray-300 dark:text-gray-600'>•</span>

              <ProfilePicture
                src={
                  room.influencer.profilePicture
                    ? `${BACKEND_URL}/uploads/${room.influencer.profilePicture}`
                    : ''
                }
                alt={room.influencer.name}
                size='small'
                className={{ container: 'w-4 h-4 mr-1' }}
              />

              <span className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                {room.influencer.name}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
