'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiTrash2 } from 'react-icons/fi';
import Modal from '@/components/modals/Modal';
import {
  DEFAULT_CAMPAIGN_IMAGE,
  SUPPORTED_SOCIAL_MEDIAS,
} from '@/utils/constants';
import { formatDate, timeSince } from '@/utils/date';
import { BACKEND_URL } from '@/utils/secrets';

export function CampaignCard({
  campaign,
  showImage = true,
  showStatus = true,
  onDeleteCampaign,
}: {
  campaign: any;
  showImage?: boolean;
  showStatus?: boolean;
  onDeleteCampaign: (campaignId: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDeleteCampaign(campaign._id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className='flex-1 md:flex-1/2 flex min-w-[49%] items-stretch justify-stretch gap-2 shadow-md rounded-xl bg-white dark:bg-gray-800 p-2 relative'>
      {showImage && (
        <Image
          src={
            !campaign.image
              ? DEFAULT_CAMPAIGN_IMAGE
              : `${BACKEND_URL}/uploads/${campaign.image}`
          }
          width={200}
          height={200}
          className='rounded-lg w-[30%] max-h-[150px] aspect-video'
          alt={campaign.name}
        />
      )}
      <div className='w-full flex flex-col items-start justify-between py-2'>
        <h2 className='text-md font-bold dark:text-white'>{campaign.name}</h2>
        <p className='text-sm text-[#868686] dark:text-gray-400'>
          {campaign.model || 'No model specified'}
        </p>
        <p className='text-sm text-[#1E1E1E] dark:text-gray-300 my-1'>
          {campaign.product
            ? `${campaign.product.name} - ${campaign.product.category}`
            : 'No product details'}
        </p>
        <div className='flex items-center gap-2 flex-wrap'>
          {campaign.platforms && campaign.platforms.length > 0 ? (
            campaign.platforms.map((platform: string) => {
              const Icon = SUPPORTED_SOCIAL_MEDIAS.find(
                (social) => social.name.toLowerCase() === platform.toLowerCase()
              )?.svg;

              return Icon ? (
                <div
                  key={platform}
                  className='flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs'
                >
                  <Icon className='w-4 h-4' />
                  <span className='dark:text-gray-200'>{platform}</span>
                </div>
              ) : null;
            })
          ) : (
            <span className='text-xs text-gray-400'>No platforms selected</span>
          )}
        </div>
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-x-2'>
            <p className='text-[#868686] dark:text-gray-400 text-xs font-semibold'>
              Posted {timeSince(campaign.createdAt)} ago.
            </p>
            <p className='text-[#868686] dark:text-gray-400 text-xs font-semibold'>
              Updated {formatDate(campaign.updatedAt)}
            </p>
          </div>
          <div className='flex items-center gap-x-2'>
            {showStatus && campaign.status && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : campaign.status === 'closed'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : campaign.status === 'review'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {campaign.status}
              </span>
            )}
            <Link
              className='text-[#F70349] text-sm font-semibold dark:text-pink-400 hover:underline'
              href={
                campaign.status !== 'draft'
                  ? `/campaigns/${campaign._id}`
                  : `/brand/campaign/create?draft=${campaign._id}`
              }
            >
              {campaign.status !== 'draft' ? 'View' : 'Continue'}
            </Link>
            <button
              onClick={handleDelete}
              className='text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors dark:hover:bg-red-900 absolute right-1 top-1'
              title='Delete campaign'
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal using the Modal component */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title='Confirm Delete'
      >
        <div className='px-2 py-4'>
          <p className='mb-6 text-gray-700 dark:text-gray-300'>
            Are you sure you want to delete the campaign "
            <span className='font-semibold'>{campaign.name}</span>"? This action
            cannot be undone.
          </p>
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className='px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors dark:text-white'
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
