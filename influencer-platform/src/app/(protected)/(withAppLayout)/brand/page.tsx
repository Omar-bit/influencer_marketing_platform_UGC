'use client';
import ActiveCampaigns from '@/components/brand/ActiveCampaigns';
import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaDollarSign,
  FaUsers,
  FaRegCalendarAlt,
} from 'react-icons/fa';
import { IoMdTrendingUp } from 'react-icons/io';
import { HiOutlineChartBar } from 'react-icons/hi';
import { MdOutlineBarChart } from 'react-icons/md';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { SUPPORTED_SOCIAL_MEDIAS } from '@/utils/constants';
import Image from 'next/image';
import { BACKEND_URL } from '@/utils/secrets';
import useBrandCampaigns from '@/hooks/useBrandCampaigns';
import { useSession } from 'next-auth/react';
import { getBrandDashboardStats } from '@/utils/api/handlers/campaign';
import { toast } from 'react-toastify';

export default function SearchInfluencersPage() {
  'use client';
  const { data: session } = useSession();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  //@ts-ignore
  const userId = session?.user?._id;
  const { data: activeCampaigns } = useBrandCampaigns(userId, {
    status: 'pending',
    enabled: true,
  });

  const { data: completedCampaigns } = useBrandCampaigns(userId, {
    status: 'closed',
    enabled: true,
  });

  // Fetch real dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await getBrandDashboardStats();
        if (response.success) {
          setDashboardStats(response.data);
        } else {
          console.error('Failed to fetch dashboard stats:', response.message);
          toast.error('Failed to load dashboard statistics');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [userId]);

  // Use real data if available, otherwise show loading state or fallback
  const totalReach = dashboardStats?.totalReach || 0;
  const totalEngagement = dashboardStats?.totalEngagement || 0;
  const estimatedROI = dashboardStats?.estimatedROI || 0;
  const totalCampaigns =
    dashboardStats?.totalCampaigns ||
    (activeCampaigns?.length || 0) + (completedCampaigns?.length || 0);

  // Use real platform stats or fallback to mock data
  const platformStats =
    dashboardStats?.platformStats?.length > 0
      ? dashboardStats.platformStats.map((platform: any) => ({
          name: platform.name,
          percentage: platform.percentage,
          color:
            platform.name === 'Instagram'
              ? 'bg-pink-500'
              : platform.name === 'Tiktok'
              ? 'bg-black'
              : platform.name === 'Youtube'
              ? 'bg-red-600'
              : platform.name === 'Facebook'
              ? 'bg-blue-600'
              : 'bg-gray-500',
        }))
      : [
          { name: 'Instagram', percentage: 45, color: 'bg-pink-500' },
          { name: 'TikTok', percentage: 30, color: 'bg-black' },
          { name: 'Youtube', percentage: 15, color: 'bg-red-600' },
          { name: 'Facebook', percentage: 10, color: 'bg-blue-600' },
        ];

  return (
    <div className='space-y-4 max-w-full w-full dark:bg-gray-900 p-4'>
      {/* Welcome Header */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold dark:text-white'>
            Welcome back, {session?.user?.name || 'Brand'}
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Here's an overview of your campaign performance and metrics
          </p>
        </div>
        <Link href='/brand/campaign/create'>
          <Button
            user='brand'
            color='primary'
            className='flex items-center gap-2 mt-3 md:mt-0'
          >
            <span>Create Campaign</span>
          </Button>
        </Link>
      </div>

      {/* Stats Overview Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {' '}
        {/* Total Campaigns */}
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Total Campaigns
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                {loading ? '...' : totalCampaigns}
              </h3>
            </div>
            <div className='p-2 bg-purple-100 dark:bg-purple-900 rounded-lg'>
              <FaRegCalendarAlt className='text-purple-500 dark:text-purple-300 size-5' />
            </div>
          </div>
          <div className='mt-3 text-xs flex items-center text-green-500'>
            <IoMdTrendingUp className='mr-1' />
            <span>
              +{dashboardStats?.activeCampaigns || 0} active campaigns
            </span>
          </div>
        </div>
        {/* Total Reach */}
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Total Reach
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                {loading ? '...' : totalReach.toLocaleString()}
              </h3>
            </div>
            <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
              <FaUsers className='text-blue-500 dark:text-blue-300 size-5' />
            </div>
          </div>
          <div className='mt-3 text-xs flex items-center text-green-500'>
            <IoMdTrendingUp className='mr-1' />
            <span>From {dashboardStats?.contentCount || 0} content pieces</span>
          </div>
        </div>
        {/* Total Engagement */}
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Total Engagement
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                {loading ? '...' : totalEngagement.toLocaleString()}
              </h3>
            </div>
            <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
              <FaChartLine className='text-blue-500 dark:text-blue-300 size-5' />
            </div>
          </div>
          <div className='mt-3 text-xs flex items-center text-green-500'>
            <IoMdTrendingUp className='mr-1' />
            <span>
              Rate: {dashboardStats?.metrics?.engagementRate || '0.00'}%
            </span>
          </div>
        </div>
        {/* Est. Campaign ROI */}
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Est. Campaign ROI
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                {loading ? '...' : `${(estimatedROI * 100).toFixed(1)}%`}
              </h3>
            </div>
            <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
              <FaDollarSign className='text-green-500 dark:text-green-300 size-5' />
            </div>
          </div>
          <div className='mt-3 text-xs flex items-center text-green-500'>
            <IoMdTrendingUp className='mr-1' />
            <span>
              Investment: $
              {dashboardStats?.totalInvestment?.toLocaleString() || '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance by Platform */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4'>
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-semibold mb-4 dark:text-white'>
            Performance by Platform
          </h3>

          <div className='space-y-4'>
            {platformStats.map((platform: any) => (
              <div key={platform.name} className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center'>
                    {SUPPORTED_SOCIAL_MEDIAS.find(
                      (sm) =>
                        sm.name.toLowerCase() === platform.name.toLowerCase()
                    )?.svg &&
                      React.createElement(
                        SUPPORTED_SOCIAL_MEDIAS.find(
                          (sm) =>
                            sm.name.toLowerCase() ===
                            platform.name.toLowerCase()
                        )?.svg,
                        { className: 'mr-2 size-4' }
                      )}
                    <span className='text-sm dark:text-gray-200'>
                      {platform.name}
                    </span>
                  </div>
                  <span className='text-sm font-medium dark:text-gray-200'>
                    {platform.percentage}%
                  </span>
                </div>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                  <div
                    className={`${platform.color} h-2 rounded-full`}
                    style={{ width: `${platform.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Status Summary */}
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-semibold mb-4 dark:text-white'>
            Campaign Status
          </h3>

          <div className='relative pt-1'>
            <div className='flex mb-2 items-center justify-between'>
              <div>
                <span className='text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 dark:bg-green-900 dark:text-green-300'>
                  Active
                </span>
              </div>{' '}
              <div className='text-right'>
                <span className='text-xs font-semibold inline-block text-green-600 dark:text-green-300'>
                  {dashboardStats?.activeCampaigns ||
                    activeCampaigns?.length ||
                    0}{' '}
                  campaigns
                </span>
              </div>
            </div>
            <div className='flex mb-2 items-center justify-between mt-4'>
              <div>
                <span className='text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-900 dark:text-blue-300'>
                  Completed
                </span>
              </div>
              <div className='text-right'>
                <span className='text-xs font-semibold inline-block text-blue-600 dark:text-blue-300'>
                  {dashboardStats?.completedCampaigns ||
                    completedCampaigns?.length ||
                    0}{' '}
                  campaigns
                </span>
              </div>
            </div>

            {/* Campaign Allocation Chart */}
            <div className='mt-6'>
              <h4 className='text-sm font-medium mb-2 dark:text-gray-300'>
                Budget Allocation
              </h4>
              <div className='flex h-24'>
                {/* Mock data for campaign budget allocation */}
                <div
                  className='bg-brand-primary h-full rounded-l-lg'
                  style={{ width: '35%' }}
                >
                  <div className='h-full flex items-center justify-center'>
                    <span className='text-xs text-white font-medium'>
                      Content Creation
                    </span>
                  </div>
                </div>
                <div className='bg-purple-400 h-full' style={{ width: '25%' }}>
                  <div className='h-full flex items-center justify-center'>
                    <span className='text-xs text-white font-medium'>
                      Brand Awareness
                    </span>
                  </div>
                </div>
                <div className='bg-purple-500 h-full' style={{ width: '20%' }}>
                  <div className='h-full flex items-center justify-center'>
                    <span className='text-xs text-white font-medium'>
                      Product Launch
                    </span>
                  </div>
                </div>
                <div
                  className='bg-purple-700 h-full rounded-r-lg'
                  style={{ width: '20%' }}
                >
                  <div className='h-full flex items-center justify-center'>
                    <span className='text-xs text-white font-medium'>
                      Affiliate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Campaigns Section */}
      <div className='mt-6'>
        <h2 className='text-xl font-bold mb-4 dark:text-white'>
          Active Campaigns
        </h2>
        <ActiveCampaigns />
      </div>

      {/* Quick Access Links */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
        <Link href='/brand/influencers'>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 cursor-pointer'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold dark:text-white'>
                Find Influencers
              </h3>
              <FaUsers className='text-brand-primary size-5' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
              Discover and connect with influencers for your campaigns
            </p>
          </div>
        </Link>

        <Link href='/brand/campaign/applications'>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 cursor-pointer'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold dark:text-white'>
                Applications
              </h3>
              <HiOutlineChartBar className='text-brand-primary size-5' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
              Review and manage campaign applications
            </p>
          </div>
        </Link>

        <Link href='/brand/influencers/list'>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 cursor-pointer'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold dark:text-white'>
                Influencer Lists
              </h3>
              <MdOutlineBarChart className='text-brand-primary size-5' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
              Manage your lists of influencers
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
