'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiCheck, FiX } from 'react-icons/fi';
import {
  getAdminCampaigns,
  updateCampaignStatus,
} from '@/utils/api/handlers/admin';
import Image from 'next/image';
import { BACKEND_URL } from '@/utils/secrets';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { DEFAULT_CAMPAIGN_IMAGE } from '@/utils/constants';

interface Business {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface Campaign {
  _id: string;
  name: string;
  description: string;
  image?: string;
  status: 'draft' | 'review' | 'pending' | 'closed';
  business: Business;
  budget: number;
  createdAt: string;
  isSponsored: boolean;
  nbrOfInfluencers: number;
  platforms: string[];
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [searchTerm, selectedStatus, campaigns]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const { data } = await getAdminCampaigns();
      setCampaigns(data);
      setFilteredCampaigns(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = [...campaigns];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          campaign.business?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by campaign status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(
        (campaign) => campaign.status === selectedStatus
      );
    }

    setFilteredCampaigns(filtered);
  };

  const handleUpdateCampaignStatus = async (
    campaignId: string,
    status: 'unpaid' | 'rejected'
  ) => {
    try {
      setIsProcessing((prev) => ({ ...prev, [campaignId]: true }));

      await updateCampaignStatus(campaignId, status);

      // Update local state to reflect the change
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign._id === campaignId
            ? {
                ...campaign,
                status: status === 'unpaid' ? 'pending' : 'review',
              }
            : campaign
        )
      );

      toast.success(
        `Campaign ${status === 'unpaid' ? 'approved' : 'rejected'} successfully`
      );
    } catch (err) {
      console.error('Error updating campaign status:', err);
      toast.error('Failed to update campaign status');
    } finally {
      setIsProcessing((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const renderPlatformBadges = (platforms: string[]) => {
    return (
      <div className='flex flex-wrap gap-1'>
        {platforms.map((platform, index) => (
          <span
            key={index}
            className='bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs'
          >
            {platform}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className='p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
      <h1 className='text-2xl font-bold mb-6 text-gray-800 dark:text-white'>
        Campaign Management
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
            placeholder='Search campaigns...'
            className='pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className='border rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value='all'>All Campaigns</option>
          <option value='review'>Under Review</option>
          <option value='pending'>Approved</option>
          <option value='draft'>Draft</option>
          <option value='closed'>Closed</option>
        </select>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-40'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500'></div>
        </div>
      ) : (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
          {filteredCampaigns.length > 0 ? (
            <div className='grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-700'>
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  className='p-6 hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4'>
                    <div className='flex items-center mb-4 sm:mb-0'>
                      <div className='flex-shrink-0 h-12 w-12 relative rounded-md overflow-hidden'>
                        <Image
                          src={
                            campaign.image
                              ? `${BACKEND_URL}/uploads/${campaign.image}`
                              : DEFAULT_CAMPAIGN_IMAGE
                          }
                          alt={campaign.name}
                          width={48}
                          height={48}
                          className='object-cover'
                        />
                      </div>
                      <div className='ml-4'>
                        <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                          {campaign.name}
                        </h2>
                        <div className='flex items-center mt-1'>
                          {campaign.business && (
                            <>
                              <div className='flex-shrink-0 h-5 w-5 relative rounded-full overflow-hidden mr-2'>
                                <Image
                                  src={
                                    campaign.business.profilePicture
                                      ? `${BACKEND_URL}/uploads/${campaign.business.profilePicture}`
                                      : DEFAULT_CAMPAIGN_IMAGE
                                  }
                                  alt={campaign.business.name}
                                  width={20}
                                  height={20}
                                  className='object-cover'
                                />
                              </div>
                              <span className='text-sm text-gray-500 dark:text-gray-400'>
                                {campaign.business.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          campaign.status === 'pending'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : campaign.status === 'review'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : campaign.status === 'closed'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {campaign.status === 'review'
                          ? 'Under Review'
                          : campaign.status.charAt(0).toUpperCase() +
                            campaign.status.slice(1)}
                      </span>

                      {campaign.isSponsored && (
                        <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
                          Sponsored
                        </span>
                      )}
                    </div>
                  </div>

                  <p className='text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2'>
                    {campaign.description}
                  </p>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                    <div>
                      <span className='text-xs text-gray-500 dark:text-gray-400 block'>
                        Budget
                      </span>
                      <span className='font-semibold'>${campaign.budget}</span>
                    </div>
                    <div>
                      <span className='text-xs text-gray-500 dark:text-gray-400 block'>
                        Influencers Needed
                      </span>
                      <span className='font-semibold'>
                        {campaign.nbrOfInfluencers || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className='text-xs text-gray-500 dark:text-gray-400 block'>
                        Created
                      </span>
                      <span className='font-semibold'>
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2 mb-4'>
                    {campaign.platforms &&
                      campaign.platforms.length > 0 &&
                      renderPlatformBadges(campaign.platforms)}
                  </div>

                  <div className='flex justify-between items-center mt-4'>
                    <Link
                      href={`/campaigns/${campaign._id}`}
                      className='text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center gap-1'
                      target='_blank'
                    >
                      <FiEye size={18} />
                      <span>View Details</span>
                    </Link>

                    {campaign.status === 'review' && (
                      <div className='flex gap-2'>
                        <button
                          className='flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50'
                          onClick={() =>
                            handleUpdateCampaignStatus(campaign._id, 'unpaid')
                          }
                          disabled={isProcessing[campaign._id]}
                        >
                          {isProcessing[campaign._id] ? (
                            <span className='animate-spin'>⏳</span>
                          ) : (
                            <>
                              <FiCheck size={16} />
                              <span>Approve</span>
                            </>
                          )}
                        </button>

                        <button
                          className='flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50'
                          onClick={() =>
                            handleUpdateCampaignStatus(campaign._id, 'rejected')
                          }
                          disabled={isProcessing[campaign._id]}
                        >
                          {isProcessing[campaign._id] ? (
                            <span className='animate-spin'>⏳</span>
                          ) : (
                            <>
                              <FiX size={16} />
                              <span>Reject</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='py-8 text-center text-gray-500 dark:text-gray-400'>
              No campaigns found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
