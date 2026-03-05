'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiCheck, FiCheckCircle } from 'react-icons/fi';
import {
  getAllTickets,
  markTicketAsRead,
  markAllTicketsAsRead,
} from '@/utils/api/handlers/ticket';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';
import { BACKEND_URL } from '@/utils/secrets';
import Button from '@/components/ui/button';

interface TicketUser {
  _id: string;
  name: string;
  email: string;
  type: 'influencer' | 'business' | 'admin';
  profilePicture?: string;
}

interface Ticket {
  _id: string;
  user: TicketUser;
  type: 'question' | 'feedback' | 'bug' | 'feature' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'inProgress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  adminResponse?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [searchTerm, selectedType, selectedStatus, showUnreadOnly, tickets]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await getAllTickets();
      if (response.success) {
        setTickets(response.data);
        setFilteredTickets(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to load tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by ticket type
    if (selectedType !== 'all') {
      filtered = filtered.filter((ticket) => ticket.type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((ticket) => ticket.status === selectedStatus);
    }

    // Filter by read status
    if (showUnreadOnly) {
      filtered = filtered.filter((ticket) => !ticket.read);
    }

    setFilteredTickets(filtered);
  };

  const handleMarkAsRead = async (ticketId: string) => {
    try {
      setIsProcessing((prev) => ({ ...prev, [ticketId]: true }));
      const response = await markTicketAsRead(ticketId);

      if (response.success) {
        // Update local state
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket._id === ticketId ? { ...ticket, read: true } : ticket
          )
        );
        toast.success('Ticket marked as read');
      } else {
        toast.error(response.message || 'Failed to mark ticket as read');
      }
    } catch (err) {
      console.error('Error marking ticket as read:', err);
      toast.error('Failed to mark ticket as read');
    } finally {
      setIsProcessing((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      const response = await markAllTicketsAsRead();

      if (response.success) {
        // Update all tickets in local state
        setTickets((prev) => prev.map((ticket) => ({ ...ticket, read: true })));
        toast.success('All tickets marked as read');
      } else {
        toast.error(response.message || 'Failed to mark all tickets as read');
      }
    } catch (err) {
      console.error('Error marking all tickets as read:', err);
      toast.error('Failed to mark all tickets as read');
    } finally {
      setIsMarkingAll(false);
    }
  };

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

  return (
    <div className='p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>
          Support Tickets
        </h1>
        <Button
          onClick={handleMarkAllAsRead}
          disabled={isMarkingAll || tickets.filter((t) => !t.read).length === 0}
          color='primary'
        >
          {isMarkingAll ? (
            'Processing...'
          ) : (
            <div className='flex items-center gap-1'>
              <FiCheckCircle /> Mark All as Read
            </div>
          )}
        </Button>
      </div>

      {error && (
        <div
          className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'
          role='alert'
        >
          <p>{error}</p>
        </div>
      )}

      <div className='flex flex-col md:flex-row justify-between mb-6 gap-4'>
        <div className='relative flex-1'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Search by title, description, or user...'
            className='pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className='flex flex-wrap gap-3'>
          <select
            className='border rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value='all'>All Types</option>
            <option value='question'>Questions</option>
            <option value='feedback'>Feedback</option>
            <option value='bug'>Bug Reports</option>
            <option value='feature'>Feature Requests</option>
            <option value='other'>Other</option>
          </select>

          <select
            className='border rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value='all'>All Statuses</option>
            <option value='pending'>Pending</option>
            <option value='inProgress'>In Progress</option>
            <option value='resolved'>Resolved</option>
          </select>

          <div className='flex items-center'>
            <input
              id='unread-only'
              type='checkbox'
              className='h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
            />
            <label
              htmlFor='unread-only'
              className='ml-2 text-sm text-gray-700 dark:text-gray-300'
            >
              Unread Only
            </label>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-40'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500'></div>
        </div>
      ) : (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-700'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Ticket
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  User
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
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      !ticket.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className='px-6 py-4'>
                      <div>
                        <div className='text-sm font-medium text-gray-900 dark:text-white flex items-center'>
                          {!ticket.read && (
                            <span className='w-2 h-2 bg-blue-600 rounded-full mr-2'></span>
                          )}
                          {ticket.title}
                        </div>
                        <div className='text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs'>
                          {ticket.description.slice(0, 50)}
                          {ticket.description.length > 50 ? '...' : ''}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-8 w-8 relative rounded-full overflow-hidden'>
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
                        <div className='ml-3'>
                          <div className='text-sm font-medium text-gray-900 dark:text-white'>
                            {ticket.user.name}
                          </div>
                          <div className='text-xs text-gray-500 dark:text-gray-400'>
                            {ticket.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'>
                        {getTicketTypeLabel(ticket.type)}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
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
                    <td className='px-6 py-4'>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority.charAt(0).toUpperCase() +
                          ticket.priority.slice(1)}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 text-right text-sm font-medium'>
                      <div className='flex justify-end gap-2'>
                        <Link
                          href={`/admin/tickets/${ticket._id}`}
                          className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                          title='View Ticket'
                        >
                          <FiEye />
                        </Link>
                        {!ticket.read && (
                          <button
                            className='text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                            title='Mark as Read'
                            onClick={() => handleMarkAsRead(ticket._id)}
                            disabled={isProcessing[ticket._id]}
                          >
                            {isProcessing[ticket._id] ? (
                              <span className='animate-spin'>⏳</span>
                            ) : (
                              <FiCheck />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className='px-6 py-4 text-center text-gray-500 dark:text-gray-400'
                  >
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
