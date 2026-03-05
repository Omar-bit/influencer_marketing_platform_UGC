'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiUserX, FiUserCheck } from 'react-icons/fi';
import { getAdminUsers, toggleUserStatus } from '@/utils/api/handlers/admin';
import Image from 'next/image';
import { BACKEND_URL } from '@/utils/secrets';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  name: string;
  email: string;
  type: 'influencer' | 'business' | 'admin';
  status: 'active' | 'inactive';
  profilePicture?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedType, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await getAdminUsers();
      setUsers(data);
      setFilteredUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by user type
    if (selectedType !== 'all') {
      filtered = filtered.filter((user) => user.type === selectedType);
    }

    setFilteredUsers(filtered);
  };

  const handleToggleStatus = async (
    userId: string,
    currentStatus: 'active' | 'inactive'
  ) => {
    try {
      setIsProcessing((prev) => ({ ...prev, [userId]: true }));
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      await toggleUserStatus(userId, newStatus);

      // Update local state to reflect the change
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );

      toast.success(
        `User ${newStatus === 'active' ? 'activated' : 'banned'} successfully`
      );
    } catch (err) {
      console.error('Error toggling user status:', err);
      toast.error('Failed to update user status');
    } finally {
      setIsProcessing((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className='p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
      <h1 className='text-2xl font-bold mb-6 text-gray-800 dark:text-white'>
        Users Management
      </h1>

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
            placeholder='Search by name or email...'
            className='pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className='border rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value='all'>All Users</option>
          <option value='influencer'>Influencers Only</option>
          <option value='business'>Brands Only</option>
          <option value='admin'>Admins Only</option>
        </select>
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
                  User
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Joined
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className='hover:bg-gray-50 dark:hover:bg-gray-700'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10 relative rounded-full overflow-hidden'>
                          <Image
                            src={
                              user.profilePicture
                                ? `${BACKEND_URL}/uploads/${user.profilePicture}`
                                : '/assets/default-avatar.png'
                            }
                            alt={user.name}
                            width={40}
                            height={40}
                            className='object-cover'
                          />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900 dark:text-white'>
                            {user.name}
                          </div>
                          <div className='text-sm text-gray-500 dark:text-gray-400'>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.type === 'influencer'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : user.type === 'business'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}
                      >
                        {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {user.status.charAt(0).toUpperCase() +
                          user.status.slice(1)}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 text-right text-sm font-medium'>
                      <div className='flex justify-end gap-2'>
                        <button
                          className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                          title='View Profile'
                          onClick={() =>
                            window.open(`/users/${user._id}`, '_blank')
                          }
                        >
                          <FiEye />
                        </button>
                        {user.type !== 'admin' && (
                          <button
                            className={`${
                              user.status === 'active'
                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                            }`}
                            title={
                              user.status === 'active'
                                ? 'Ban User'
                                : 'Activate User'
                            }
                            onClick={() =>
                              handleToggleStatus(user._id, user.status)
                            }
                            disabled={isProcessing[user._id]}
                          >
                            {isProcessing[user._id] ? (
                              <span className='animate-spin'>⏳</span>
                            ) : user.status === 'active' ? (
                              <FiUserX />
                            ) : (
                              <FiUserCheck />
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
                    colSpan={5}
                    className='px-6 py-4 text-center text-gray-500 dark:text-gray-400'
                  >
                    No users found
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
