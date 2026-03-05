'use client';

import React, { useState, useEffect } from 'react';
import { getUserTickets } from '@/utils/api/handlers/ticket';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface Ticket {
  _id: string;
  title: string;
  type: 'question' | 'feedback' | 'bug' | 'feature' | 'other';
  status: 'pending' | 'inProgress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  adminResponse?: string;
}

export default function UserTicketsList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await getUserTickets();
        if (response.success) {
          setTickets(response.data);
        } else {
          toast.error(response.message || 'Failed to load tickets');
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Could not load your tickets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Helper function to get badge colors based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inProgress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  // Helper function to get badge colors based on priority
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'low':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  // Helper function to format ticket type
  const formatTicketType = (type: string) => {
    switch (type) {
      case 'question':
        return 'Question';
      case 'feedback':
        return 'Feedback';
      case 'bug':
        return 'Bug Report';
      case 'feature':
        return 'Feature Request';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-40'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4'
        role='alert'
      >
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
      <div className='p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center'>
        <h2 className='text-lg font-semibold'>Your Tickets</h2>
        <Link
          href='/support/new'
          className='px-4 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700'
        >
          New Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className='p-6 text-center text-gray-500 dark:text-gray-400'>
          <p>You haven't submitted any tickets yet.</p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-700'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Title
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Priority
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Date
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
              {tickets.map((ticket) => (
                <tr
                  key={ticket._id}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                    {ticket.title}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                    {formatTicketType(ticket.type)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        ticket.status
                      )}`}
                    >
                      {ticket.status === 'inProgress'
                        ? 'In Progress'
                        : ticket.status.charAt(0).toUpperCase() +
                          ticket.status.slice(1)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority.charAt(0).toUpperCase() +
                        ticket.priority.slice(1)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <Link
                      href={`/support/tickets/${ticket._id}`}
                      className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300'
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
