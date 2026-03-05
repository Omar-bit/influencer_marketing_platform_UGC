'use client';

import React, { useState } from 'react';
import useGetCampaignInvitations from '@/hooks/useGetCampaignInvitations';
import { respondToInvitation } from '@/utils/api/handlers/campaign';
import Image from 'next/image';
import { BACKEND_URL } from '@/utils/secrets';
import { DEFAULT_CAMPAIGN_IMAGE } from '@/utils/constants';
import { formatDate } from '@/utils/date';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FiCheck, FiX } from 'react-icons/fi';

export default function InvitationsPage() {
  const {
    data: invitations,
    isLoading,
    error,
    refetch,
  } = useGetCampaignInvitations();
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  const handleResponse = async (
    invitationId: string,
    response: 'accepted' | 'rejected'
  ) => {
    setProcessing((prev) => ({ ...prev, [invitationId]: true }));

    try {
      await respondToInvitation(invitationId, response);
      toast.success(`Campaign invitation ${response}`);
      refetch();
    } catch (err) {
      console.error('Error responding to invitation:', err);
      toast.error('Failed to respond to invitation');
    } finally {
      setProcessing((prev) => ({ ...prev, [invitationId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        Loading invitations...
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center text-red-500'>
        Error loading campaign invitations
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md'>
        <h1 className='text-2xl font-bold mb-6 dark:text-white'>
          Campaign Invitations
        </h1>
        <div className='text-gray-500 dark:text-gray-400 text-center py-10'>
          You don't have any campaign invitations at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md'>
      <h1 className='text-2xl font-bold mb-6 dark:text-white'>
        Campaign Invitations
      </h1>

      <div className='space-y-4'>
        {invitations.map(
          (invitation: any) =>
            invitation.status === 'pending' && (
              <div
                key={invitation._id}
                className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row gap-4'
              >
                <div className='w-full md:w-1/4 h-48 md:h-auto relative overflow-hidden rounded-md'>
                  <Image
                    src={
                      invitation?.campaign?.image
                        ? `${BACKEND_URL}/uploads/${invitation.campaign.image}`
                        : DEFAULT_CAMPAIGN_IMAGE
                    }
                    alt={invitation?.campaign?.name}
                    fill
                    className='object-cover'
                  />
                </div>

                <div className='flex-1'>
                  <div className='flex items-start justify-between mb-2'>
                    <Link
                      href={`/campaigns/${invitation.campaign._id}`}
                      className='text-lg font-semibold hover:underline dark:text-white'
                    >
                      {invitation?.campaign?.name}
                    </Link>
                    <span className='text-sm text-gray-500 dark:text-gray-400'>
                      Invited on {formatDate(invitation.createdAt)}
                    </span>
                  </div>

                  <div className='mb-4'>
                    <p className='text-sm text-gray-700 dark:text-gray-300 line-clamp-2'>
                      {invitation.campaign.description}
                    </p>
                  </div>

                  <div className='flex items-center mb-4'>
                    <div className='h-10 w-10 rounded-full overflow-hidden relative mr-2'>
                      <Image
                        src={
                          invitation.campaign.business?.profilePicture
                            ? `${BACKEND_URL}/uploads/${invitation.campaign.business.profilePicture}`
                            : DEFAULT_CAMPAIGN_IMAGE
                        }
                        alt={invitation.campaign.business?.name || 'Business'}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <span className='text-sm font-medium dark:text-white'>
                      {invitation.campaign.business?.name || 'Business'}
                    </span>
                  </div>

                  <div className='flex gap-2 justify-end'>
                    <button
                      onClick={() => handleResponse(invitation._id, 'rejected')}
                      disabled={processing[invitation._id]}
                      className='px-3 py-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <FiX className='mr-1' /> Decline
                    </button>
                    <button
                      onClick={() => handleResponse(invitation._id, 'accepted')}
                      disabled={processing[invitation._id]}
                      className='px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <FiCheck className='mr-1' /> Accept
                    </button>
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
