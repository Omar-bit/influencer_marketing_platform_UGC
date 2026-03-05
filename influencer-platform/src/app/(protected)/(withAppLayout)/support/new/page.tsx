'use client';

import React from 'react';
import TicketForm from '@/components/tickets/TicketForm';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

export default function NewTicketPage() {
  const router = useRouter();

  return (
    <div className='p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
      <div className='mb-6'>
        <button
          onClick={() => router.push('/support')}
          className='flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
        >
          <FiArrowLeft className='mr-1' /> Back to Support
        </button>
      </div>

      <TicketForm />
    </div>
  );
}
