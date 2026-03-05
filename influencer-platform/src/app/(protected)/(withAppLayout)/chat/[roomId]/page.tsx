'use client';

import ChatRoom from '@/components/chat/ChatRoom';
import Link from 'next/link';

export default function ChatRoomPage() {
  return (
    <div className='container mx-auto py-6 px-4 h-full'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md h-[85vh] overflow-hidden'>
        <div className='border-b border-gray-200 dark:border-gray-700 p-4 flex items-center'>
          <Link
            href='/chat'
            className='text-brand-primary hover:text-brand-primary-dark mr-2'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
                clipRule='evenodd'
              />
            </svg>
          </Link>
          <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
            Conversation
          </h1>
        </div>

        <div className='h-[calc(100%-4rem)]'>
          <ChatRoom />
        </div>
      </div>
    </div>
  );
}
