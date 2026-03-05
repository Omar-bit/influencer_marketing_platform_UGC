'use client';

import React, { useEffect, useState } from 'react';
import { getCampaignPerformanceStats } from '@/utils/api/handlers/campaign';
import { toast } from 'react-toastify';
import BackLink from '@/components/shared/BackLink';

interface CampaignStats {
  totalRevenue: number;
  pendingPayouts: number;
  completedPayouts: number;
  failedPayouts: number;
  actionTypeSummary: {
    directCampaigns: number;
    influencerCampaigns: number;
    pendingCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    failedCampaigns: number;
  };
}

export default function CampaignPerformancePage() {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCampaignPerformanceStats();

        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.message || 'Failed to fetch campaign performance stats');
          toast.error(response.message || 'Failed to fetch campaign performance stats');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data');
        toast.error(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <BackLink userType="brand" to="/brand/campaigns" className="mr-4" />
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <BackLink userType="brand" to="/brand/campaigns" className="mr-4" />
        </div>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const totalCampaigns = (stats?.actionTypeSummary?.directCampaigns || 0) + (stats?.actionTypeSummary?.influencerCampaigns || 0);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6 flex items-center">
        <BackLink userType="brand" to="/brand/campaigns" className="mr-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-brand-primary">
          Campaign Performance
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Campaigns</h3>
          <p className="text-3xl font-bold text-brand-primary">{totalCampaigns}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Active Campaigns</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.actionTypeSummary?.activeCampaigns || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-brand-primary">${stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Payout & Financial Tracker */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Payout & Financial Tracker</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
              <span className="font-semibold text-green-600">${stats?.totalRevenue?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Pending Payouts</span>
              <span className="font-semibold text-yellow-600">${stats?.pendingPayouts?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Completed Payouts</span>
              <span className="font-semibold text-green-600">${stats?.completedPayouts?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Failed Payouts</span>
              <span className="font-semibold text-red-600">${stats?.failedPayouts?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Campaign Status Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Campaign Status Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Direct Campaigns</span>
              <span className="font-semibold">{stats?.actionTypeSummary?.directCampaigns || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Influencer Campaigns</span>
              <span className="font-semibold">{stats?.actionTypeSummary?.influencerCampaigns || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Pending Campaigns</span>
              <span className="font-semibold text-yellow-600">{stats?.actionTypeSummary?.pendingCampaigns || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Campaigns</span>
              <span className="font-semibold text-green-600">{stats?.actionTypeSummary?.activeCampaigns || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Completed Campaigns</span>
              <span className="font-semibold text-blue-600">{stats?.actionTypeSummary?.completedCampaigns || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Failed Campaigns</span>
              <span className="font-semibold text-red-600">{stats?.actionTypeSummary?.failedCampaigns || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 