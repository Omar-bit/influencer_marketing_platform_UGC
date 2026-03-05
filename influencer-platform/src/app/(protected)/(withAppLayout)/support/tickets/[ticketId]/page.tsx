'use client';

import React from 'react';
import TicketDetail from '@/components/tickets/TicketDetail';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

interface TicketDetailPageProps {
  params: {
    ticketId: string;
  };
}

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;
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

      <TicketDetail ticketId={ticketId} />
    </div>
  );
}
