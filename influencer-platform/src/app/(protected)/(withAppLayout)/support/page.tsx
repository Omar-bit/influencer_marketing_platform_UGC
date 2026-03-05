'use client';

import React from 'react';
import UserTicketsList from '@/components/tickets/UserTicketsList';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className='p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>
          Support
        </h1>
        <Link
          href='/support/new'
          className='px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors'
        >
          New Support Ticket
        </Link>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Need Help?</h2>
        <p className='mb-4'>
          Welcome to our support center. If you have questions, feedback, or
          need assistance, you can create a new support ticket and our team will
          help you.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
          <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
            <h3 className='font-semibold mb-2'>Submit a Ticket For:</h3>
            <ul className='list-disc pl-5 space-y-1'>
              <li>Technical issues or bugs</li>
              <li>Account-related questions</li>
              <li>Feature requests</li>
              <li>Payment or billing inquiries</li>
              <li>General feedback</li>
            </ul>
          </div>
          <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
            <h3 className='font-semibold mb-2'>Response Times:</h3>
            <ul className='list-disc pl-5 space-y-1'>
              <li>High priority: within 24 hours</li>
              <li>Medium priority: within 48 hours</li>
              <li>Low priority: within 72 hours</li>
            </ul>
            <p className='mt-2 text-sm'>
              Business hours: Monday-Friday, 9 AM - 5 PM
            </p>
          </div>
        </div>
      </div>

      <UserTicketsList />
    </div>
  );
}
