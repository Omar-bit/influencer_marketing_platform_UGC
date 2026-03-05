'use client';

import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { BACKEND_URL } from '@/utils/secrets';
import ProfilePicture from '../shared/ProfilePicture/ProfilePicture';

interface MessageProps {
  content: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  timestamp: string;
  isRead: boolean;
}

export default function ChatMessage({
  content,
  sender,
  timestamp,
  isRead,
}: MessageProps) {
  const { data: session } = useSession();
  //@ts-ignore
  const isCurrentUser = session?.user?._id === sender._id;
  //@ts-ignore
  const loggedInUserPicture = session?.user?.profilePicture;

  return (
    <div
      className={`flex items-end ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      {!isCurrentUser && (
        <div className='flex-shrink-0 mr-2'>
          {/* <img
            src={
              sender.profilePicture
                ? `${BACKEND_URL}/uploads/${sender.profilePicture}`
                : '/assets/profile-placeholder.jpg'
            }
            alt={sender.name}
            className='w-8 h-8 rounded-full'
          /> */}
          <ProfilePicture
            src={
              sender.profilePicture
                ? `${BACKEND_URL}/uploads/${sender.profilePicture}`
                : ''
            }
            alt={sender.name}
            size='small'
            className={{ container: 'w-8 h-8' }}
          />
        </div>
      )}

      <div
        className={`max-w-[70%] ${
          isCurrentUser
            ? 'bg-brand-primary text-white rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-lg'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-tr-lg rounded-tl-sm rounded-br-lg rounded-bl-lg'
        }`}
      >
        <div className='px-4 py-2 break-words'>{content}</div>

        <div
          className={`text-xs px-4 pb-1 flex ${
            isCurrentUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span
            className={`${
              isCurrentUser
                ? 'text-white/70'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </span>

          {isCurrentUser && (
            <span className='ml-2'>
              {isRead ? (
                <svg
                  className='w-3 h-3 text-white/70'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm-7.75 7.75L6.8 11.3 5.38 12.7l4.87 4.87 1.42-1.42-1.42-1.4z' />
                </svg>
              ) : (
                <svg
                  className='w-3 h-3 text-white/70'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>

      {isCurrentUser && (
        <div className='flex-shrink-0 ml-2'>
          {/* <img
                src={
                session?.user?.profilePicture
                    ? `${BACKEND_URL}/uploads/${session.user.profilePicture}`
                    : '/assets/profile-placeholder.jpg'
                }
                alt={session?.user?.name}
                className='w-8 h-8 rounded-full'
            /> */}
          <ProfilePicture
            src={
              loggedInUserPicture
                ? `${BACKEND_URL}/uploads/${loggedInUserPicture}`
                : ''
            }
            alt={session?.user?.name || 'user'}
            size='small'
            className={{ container: 'w-8 h-8' }}
          />
        </div>
      )}
    </div>
  );
}
