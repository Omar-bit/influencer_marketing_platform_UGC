'use client';

import React, { useState, useEffect } from 'react';
import { FiUsers, FiBriefcase, FiActivity, FiCheck } from 'react-icons/fi';
import { MdCampaign } from 'react-icons/md';
import { GiMoneyStack } from 'react-icons/gi';
import { getAdminDashboardStats } from '@/utils/api/handlers/admin';

interface DashboardStats {
  totalInfluencers: number;
  totalBrands: number;
  totalCampaigns: number;
  pendingCampaigns: number;
  activeCampaigns: number;
  totalAcceptedApplications: number;
  totalPendingApplications: number;
  totalTickets: number;
  pendingTickets: number;
  unreadTickets: number;
  totalSubscriptionIncome: number;
  monthlySubscriptionIncome: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInfluencers: 0,
    totalBrands: 0,
    totalCampaigns: 0,
    pendingCampaigns: 0,
    activeCampaigns: 0,
    totalAcceptedApplications: 0,
    totalPendingApplications: 0,
    totalTickets: 0,
    pendingTickets: 0,
    unreadTickets: 0,
    totalSubscriptionIncome: 0,
    monthlySubscriptionIncome: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const { data } = await getAdminDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center'>
      <div className={`${color} p-3 rounded-full mr-4`}>{icon}</div>
      <div>
        <p className='text-gray-500 dark:text-gray-400 text-sm font-medium'>
          {title}
        </p>
        <h3 className='text-2xl font-bold'>{isLoading ? '-' : value}</h3>
      </div>
    </div>
  );
  return (
    <div className='p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
      <h1 className='text-2xl font-bold mb-6 text-gray-800 dark:text-white'>
        Dashboard
      </h1>

      {error && (
        <div
          className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'
          role='alert'
        >
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className='flex justify-center items-center h-40'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500'></div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <h2 className='text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300'>
            Platform Overview
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            <StatCard
              title='Total Influencers'
              value={stats.totalInfluencers}
              icon={<FiUsers className='text-white text-xl' />}
              color='bg-blue-500'
            />
            <StatCard
              title='Total Brands'
              value={stats.totalBrands}
              icon={<FiBriefcase className='text-white text-xl' />}
              color='bg-green-500'
            />
            <StatCard
              title='Total Campaigns'
              value={stats.totalCampaigns}
              icon={<MdCampaign className='text-white text-xl' />}
              color='bg-purple-500'
            />
          </div>

          <h2 className='text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300'>
            Subscription Income
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <StatCard
              title='Monthly Subscription Income'
              value={stats.monthlySubscriptionIncome || 0}
              icon={<GiMoneyStack className='text-white text-xl' />}
              color='bg-emerald-500'
            />
            <StatCard
              title='Total Subscription Income'
              value={stats.totalSubscriptionIncome || 0}
              icon={<GiMoneyStack className='text-white text-xl' />}
              color='bg-purple-500'
            />
          </div>

          <h2 className='text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300'>
            Campaign Statistics
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <StatCard
              title='Pending Campaigns'
              value={stats.pendingCampaigns}
              icon={<MdCampaign className='text-white text-xl' />}
              color='bg-yellow-500'
            />
            <StatCard
              title='Active Campaigns'
              value={stats.activeCampaigns}
              icon={<FiActivity className='text-white text-xl' />}
              color='bg-blue-500'
            />
            <StatCard
              title='Accepted Applications'
              value={stats.totalAcceptedApplications}
              icon={<FiCheck className='text-white text-xl' />}
              color='bg-green-500'
            />
            <StatCard
              title='Pending Applications'
              value={stats.totalPendingApplications}
              icon={<FiActivity className='text-white text-xl' />}
              color='bg-orange-500'
            />{' '}
          </div>

          <h2 className='text-lg font-semibold mb-4 mt-8 text-gray-700 dark:text-gray-300'>
            Support Ticket Statistics
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-4'>
            <StatCard
              title='Total Tickets'
              value={stats.totalTickets}
              icon={<FiActivity className='text-white text-xl' />}
              color='bg-purple-500'
            />
            <StatCard
              title='Pending Tickets'
              value={stats.pendingTickets}
              icon={<FiActivity className='text-white text-xl' />}
              color='bg-yellow-500'
            />
            <StatCard
              title='Unread Tickets'
              value={stats.unreadTickets}
              icon={<FiActivity className='text-white text-xl' />}
              color='bg-red-500'
            />
          </div>
          {stats.unreadTickets > 0 && (
            <div className='mt-2 text-right'>
              <a
                href='/admin/tickets'
                className='text-sm text-purple-600 hover:text-purple-800 font-medium'
              >
                View all tickets →
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
