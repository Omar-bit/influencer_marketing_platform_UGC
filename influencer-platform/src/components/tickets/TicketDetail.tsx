'use client';

import React, { useState, useEffect } from 'react';
import { getTicketById } from '@/utils/api/handlers/ticket';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { BACKEND_URL } from '@/utils/secrets';
import { useRouter } from 'next/navigation';

interface TicketDetailProps {
  ticketId: string;
}

interface TicketUser {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface TicketDetail {
  _id: string;
  title: string;
  description: string;
  type: 'question' | 'feedback' | 'bug' | 'feature' | 'other';
  status: 'pending' | 'inProgress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
  user: TicketUser;
}

export default function TicketDetail({ ticketId }: TicketDetailProps) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        const response = await getTicketById(ticketId);
        if (response.success) {
          setTicket(response.data);
        } else {
          toast.error(response.message || 'Failed to load ticket details');
          setError(response.message || 'Failed to load ticket details');
        }
      } catch (err) {
        console.error('Error fetching ticket details:', err);
        setError('Could not load ticket details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to get status badge color
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

  // Helper function to get priority badge color
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

  // Helper function for ticket type label
  const getTicketTypeLabel = (type: string) => {
    const types = {
      question: 'Question',
      feedback: 'Feedback',
      bug: 'Bug Report',
      feature: 'Feature Request',
      other: 'Other',
    };
    return types[type as keyof typeof types] || type;
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-40'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500'></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div
        className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4'
        role='alert'
      >
        <p>{error || 'Ticket not found'}</p>
        <button
          onClick={() => router.back()}
          className='mt-2 text-red-700 underline'
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
      <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              {ticket.title}
            </h1>
            <div className='flex flex-wrap gap-2 mb-4'>
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
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(
                  ticket.priority
                )}`}
              >
                {ticket.priority.charAt(0).toUpperCase() +
                  ticket.priority.slice(1)}{' '}
                Priority
              </span>
              <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'>
                {getTicketTypeLabel(ticket.type)}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          >
            Back
          </button>
        </div>

        <div className='flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4'>
          <div className='flex-shrink-0 h-8 w-8 relative rounded-full overflow-hidden mr-2'>
            <Image
              src={
                ticket.user.profilePicture
                  ? `${BACKEND_URL}/uploads/${ticket.user.profilePicture}`
                  : '/assets/default-avatar.png'
              }
              alt={ticket.user.name}
              width={32}
              height={32}
              className='object-cover'
            />
          </div>
          <span>{ticket.user.name}</span>
          <span className='mx-2'>•</span>
          <span>{formatDate(ticket.createdAt)}</span>
        </div>
      </div>

      <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
        <h2 className='text-lg font-semibold mb-2'>Description</h2>
        <div className='prose dark:prose-invert max-w-none'>
          <p className='whitespace-pre-line'>{ticket.description}</p>
        </div>
      </div>

      {ticket.adminResponse && (
        <div className='p-6 bg-gray-50 dark:bg-gray-700'>
          <h2 className='text-lg font-semibold mb-2'>Admin Response</h2>
          <div className='prose dark:prose-invert max-w-none'>
            <p className='whitespace-pre-line'>{ticket.adminResponse}</p>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
              Last updated: {formatDate(ticket.updatedAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
