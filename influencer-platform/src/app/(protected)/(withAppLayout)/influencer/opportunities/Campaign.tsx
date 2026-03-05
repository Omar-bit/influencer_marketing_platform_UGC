'use client';
import {
  bookMarkCampaign,
  removeBookmarkedCampaign,
} from '@/utils/api/handlers/bookMarks';
import { SUPPORTED_SOCIAL_MEDIAS } from '@/utils/constants';
import { formatDate, timeSince } from '@/utils/date';
import Link from 'next/link';
import { useState } from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Campaign({
  campaign,
  showImage = true,
  showStatus = true,
  onBookmark = null,
}: any) {
  const [saved, setSaved] = useState(campaign.isSaved);
  async function handleBookmark() {
    let handler: any = bookMarkCampaign;
    let payload: any = {
      campaignId: campaign._id,
    };
    if (campaign.isSaved) {
      handler = removeBookmarkedCampaign;
      payload = campaign._id;
    }
    try {
      const { data, success } = await handler(payload);
      if (success) {
        campaign.isSaved = !campaign.isSaved;
      }
      toast.success(
        campaign.isSaved
          ? 'Campaign bookmarked successfully!'
          : 'Campaign removed from bookmarks!'
      );
      setSaved(campaign.isSaved);
      if (onBookmark) {
        onBookmark();
      }
    } catch (error) {
      toast.error('Error updating bookmark. Please try again later.');
      console.error('Error updating bookmark:', error);
    }
  }
  // Application status badge styles and colors
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      accepted: {
        bg: 'bg-green-100 dark:bg-green-800',
        text: 'text-green-800 dark:text-green-100',
        label: 'Accepted',
      },
      pending: {
        bg: 'bg-yellow-100 dark:bg-yellow-800',
        text: 'text-yellow-800 dark:text-yellow-100',
        label: 'Pending',
      },
      rejected: {
        bg: 'bg-red-100 dark:bg-red-800',
        text: 'text-red-800 dark:text-red-100',
        label: 'Rejected',
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className='relative rounded-xl overflow-hidden transition-all duration-300 group shadow border'>
      {/* Card with gradient background by default and white on hover */}
      <div className='p-4 hover:bg-gradient-to-r from-[#FF1F8E] to-[#FFCC25] hover:text-white text-black bg-white dark:bg-gray-800 dark:text-white  h-full flex flex-col transition-all duration-300 group-hover:bg-white group-hover:text-black dark:group-hover:bg-gray-800 dark:group-hover:text-white rounded-xl shadow-md'>
        {/* Bookmark icon */}
        <button className='absolute top-3 right-3' onClick={handleBookmark}>
          {saved ? (
            <FaBookmark className='hover:text-influencer-primary' />
          ) : (
            <FaRegBookmark className='hover:text-influencer-primary' />
          )}
        </button>

        {/* Content */}
        <div className='flex flex-col h-full text-black dark:text-white group-hover:text-white'>
          {/* Campaign Name and Application Status */}
          <div className=''>
            {campaign.applicationStatus && (
              <div className=''>
                {getStatusBadge(campaign.applicationStatus)}
              </div>
            )}
            <h2 className='text-md font-bold'>{campaign.name}</h2>
          </div>

          {/* Service and Location */}
          <div className='flex justify-between mb-2'>
            <p className='text-xs opacity-80'>{campaign.ecommerceCategory}</p>
            <p className='text-xs opacity-80'>{campaign.country}</p>
          </div>

          {/* Brand Name */}
          <p className='text-sm font-medium mb-2'>
            {campaign.brand || campaign.model || 'Brand Name'}
          </p>

          {/* Application Proposal if available */}
          {campaign.proposal && (
            <div className='mb-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-md'>
              <p className='text-xs font-medium mb-1'>Your Proposal:</p>
              <p className='text-xs opacity-90 line-clamp-2'>
                {campaign.proposal}
              </p>
            </div>
          )}

          {/* Social Media Platforms */}
          <div className='flex gap-2 mb-3'>
            {campaign.platforms && campaign.platforms.length > 0 ? (
              campaign.platforms.map((platform: string) => {
                const Icon = SUPPORTED_SOCIAL_MEDIAS.find(
                  (social) =>
                    social.name.toLowerCase() === platform.toLowerCase()
                )?.svg;

                return (
                  <div
                    className='flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-[#F2F2F2] dark:bg-gray-700 text-[#404040] dark:text-gray-200'
                    key={platform}
                  >
                    {Icon && <Icon className='size-4' />}
                    <span>{platform}</span>
                  </div>
                );
              })
            ) : (
              <span className='text-xs opacity-70'>No platforms selected</span>
            )}
          </div>

          {/* Posted and Updated info with View button */}
          <div className='mt-auto flex items-center justify-between'>
            <div className='flex flex-col'>
              {campaign.appliedAt ? (
                <p className='text-xs opacity-80'>
                  Applied {timeSince(campaign.appliedAt)} ago
                </p>
              ) : (
                <p className='text-xs opacity-80'>
                  Posted {timeSince(campaign.createdAt)} ago
                </p>
              )}
              <p className='text-xs opacity-80'>
                Updated {formatDate(campaign.updatedAt)}
              </p>
            </div>
            <Link
              className='px-3 py-1 rounded-full text-sm font-medium bg-white text-[#FF1F8E] dark:bg-gray-700 dark:text-pink-400 group-hover:bg-[#FF1F8E] group-hover:text-white dark:group-hover:bg-pink-600 dark:group-hover:text-white'
              href={`/campaigns/${campaign._id}`}
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
