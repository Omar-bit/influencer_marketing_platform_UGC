'use client';

import React, { useState, useEffect } from 'react';
import {
  getTicketById,
  updateTicketStatus,
  markTicketAsRead,
} from '@/utils/api/handlers/ticket';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { BACKEND_URL } from '@/utils/secrets';
import { useParams, useRouter } from 'next/navigation';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/button';
import Select from '@/components/ui/Select';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

interface AdminTicketDetailProps {
  params: {
    ticketId: string;
  };
}

interface TicketUser {
  _id: string;
  name: string;
  email: string;
  type: 'influencer' | 'business' | 'admin';
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
  read: boolean;
  createdAt: string;
  updatedAt: string;
  user: TicketUser;
}

export default function AdminTicketDetailPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [status, setStatus] = useState<'pending' | 'inProgress' | 'resolved'>(
    'pending'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const router = useRouter();

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'inProgress' },
    { label: 'Resolved', value: 'resolved' },
  ];

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const response = await getTicketById(ticketId);

      if (response.success) {
        setTicket(response.data);
        setAdminResponse(response.data.adminResponse || '');
        setStatus(response.data.status);
      } else {
        setError(response.message || 'Failed to load ticket details');
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError('Could not load ticket details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    if (!ticket || ticket.read) return;

    try {
      setIsMarkingRead(true);
      const response = await markTicketAsRead(ticketId);

      if (response.success) {
        setTicket({
          ...ticket,
          read: true,
        });
        toast.success('Ticket marked as read');
      } else {
        toast.error(response.message || 'Failed to mark ticket as read');
      }
    } catch (err) {
      console.error('Error marking ticket as read:', err);
      toast.error('Failed to mark ticket as read');
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await updateTicketStatus(ticketId, {
        status,
        adminResponse: adminResponse.trim(),
      });

      if (response.success) {
        setTicket({
          ...ticket!,
          status,
          adminResponse,
          read: true,
        });
        toast.success('Ticket updated successfully');
      } else {
        toast.error(response.message || 'Failed to update ticket');
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
      toast.error('Failed to update ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (selectedOption: any) => {
    setStatus(selectedOption.value);
  };

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
      <div className='p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
        <div className='flex justify-center items-center h-40'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500'></div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className='p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
        <div
          className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4'
          role='alert'
        >
          <p>{error || 'Ticket not found'}</p>
          <button
            onClick={() => router.push('/admin/tickets')}
            className='mt-2 text-red-700 underline flex items-center gap-1'
          >
            <FiArrowLeft /> Return to Tickets List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
      <div className='mb-6 flex justify-between items-center'>
        <button
          onClick={() => router.push('/admin/tickets')}
          className='flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
        >
          <FiArrowLeft className='mr-1' /> Back to Tickets
        </button>

        {!ticket.read && (
          <Button
            onClick={handleMarkAsRead}
            disabled={isMarkingRead}
            color='primary'
            variant='light'
          >
            {isMarkingRead ? (
              'Processing...'
            ) : (
              <div className='flex items-center gap-1'>
                <FiCheckCircle /> Mark as Read
              </div>
            )}
          </Button>
        )}
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                {ticket.title}
                {!ticket.read && (
                  <span className='ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block'></span>
                )}
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
          </div>

          <div className='flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4'>
            <div className='flex-shrink-0 h-10 w-10 relative rounded-full overflow-hidden mr-2'>
              <Image
                src={
                  ticket.user.profilePicture
                    ? `${BACKEND_URL}/uploads/${ticket.user.profilePicture}`
                    : '/assets/default-avatar.png'
                }
                alt={ticket.user.name}
                width={40}
                height={40}
                className='object-cover'
              />
            </div>
            <div>
              <div className='font-medium'>{ticket.user.name}</div>
              <div className='text-xs'>{ticket.user.email}</div>
            </div>
            <span className='mx-2'>•</span>
            <span>{formatDate(ticket.createdAt)}</span>
            <span className='mx-2'>•</span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                ticket.user.type === 'influencer'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : ticket.user.type === 'business'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              }`}
            >
              {ticket?.user?.type?.charAt(0).toUpperCase() +
                ticket?.user?.type?.slice(1)}
            </span>
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
            <h2 className='text-lg font-semibold mb-2'>Previous Response</h2>
            <div className='prose dark:prose-invert max-w-none'>
              <p className='whitespace-pre-line'>{ticket.adminResponse}</p>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                Last updated: {formatDate(ticket.updatedAt)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
        <div className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>Ticket Response</h2>
          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label className='block mb-2 text-sm font-medium'>
                Update Status
              </label>
              <Select
                options={statusOptions}
                value={statusOptions.find((option) => option.value === status)}
                setValue={handleStatusChange}
                placeholder='Select status'
              />
            </div>

            <div className='mb-4'>
              <TextArea
                label='Admin Response'
                name='adminResponse'
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder='Enter your response to the ticket...'
                rows={5}
              />
            </div>

            <div className='flex justify-end'>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Ticket'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
