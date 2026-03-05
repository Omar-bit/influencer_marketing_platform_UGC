'use client';

import ChatList from '@/components/chat/ChatList';

export default function ChatPage() {
  return (
    <div className='container mx-auto py-6 px-4 h-full'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md h-[85vh] overflow-hidden'>
        <div className='border-b border-gray-200 dark:border-gray-700 p-4'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Messages
          </h1>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Your conversations with brands and influencers
          </p>
        </div>

        <div className='h-[calc(100%-5rem)] overflow-y-auto'>
          <ChatList />
        </div>
      </div>
    </div>
  );
}
