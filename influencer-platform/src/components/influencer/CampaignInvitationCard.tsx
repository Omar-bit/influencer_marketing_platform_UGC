'use client';

import React from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Button from '@/components/ui/button';
import { BACKEND_URL } from '@/utils/secrets';
import { respondToInvitation } from '@/utils/api/handlers/campaign';

interface CampaignInvitationCardProps {
  invitation: {
    _id: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
    campaign: {
      _id: string;
      name: string;
      description: string;
      image?: string;
      budget: number;
      platforms: string[];
      business: {
        _id: string;
        name: string;
        profilePicture?: string;
      };
    };
  };
  onStatusChange: () => void;
}

export default function CampaignInvitationCard({
  invitation,
  onStatusChange,
}: CampaignInvitationCardProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleInvitationResponse = async (
    response: 'accepted' | 'rejected'
  ) => {
    try {
      setLoading(true);
      await respondToInvitation(invitation._id, response);
      toast.success(
        `Invitation ${
          response === 'accepted' ? 'accepted' : 'declined'
        } successfully`
      );
      onStatusChange();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Failed to respond to invitation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const viewCampaignDetails = () => {
    router.push(`/campaigns/${invitation.campaign._id}`);
  };

  // If invitation is already responded to, show different UI
  if (invitation.status !== 'pending') {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 border-l-4 border-gray-300 dark:border-gray-600'>
        <div className='flex justify-between items-center mb-2'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
            {invitation.campaign.name}
          </h3>
          <span
            className={`text-sm px-2 py-1 rounded ${
              invitation.status === 'accepted'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {invitation.status.charAt(0).toUpperCase() +
              invitation.status.slice(1)}
          </span>
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
          From: {invitation.campaign.business.name}
        </p>
        <p className='text-xs text-gray-500 dark:text-gray-400 mb-2'>
          Responded on {formatDate(invitation.createdAt)}
        </p>
        <div className='flex justify-end'>
          <Button
            user='influencer'
            color='primary'
            variant='outlined'
            onClick={viewCampaignDetails}
          >
            View Campaign
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden'>
      <div className='relative h-40 bg-gray-200 dark:bg-gray-700'>
        {invitation.campaign.image ? (
          <Image
            src={`${BACKEND_URL}/uploads/${invitation.campaign.image}`}
            alt={invitation.campaign.name}
            fill
            className='object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-brand-primary/10'>
            <span className='text-brand-primary text-xl font-bold'>
              {invitation.campaign.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className='p-4'>
        <div className='flex items-center gap-2 mb-2'>
          <div className='w-8 h-8 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600'>
            {invitation.campaign.business.profilePicture ? (
              <Image
                src={`${BACKEND_URL}/uploads/${invitation.campaign.business.profilePicture}`}
                alt={invitation.campaign.business.name}
                width={32}
                height={32}
                className='object-cover w-full h-full'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300'>
                {invitation.campaign.business.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            {invitation.campaign.business.name}
          </span>
        </div>

        <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1'>
          {invitation.campaign.name}
        </h3>

        <p className='text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2'>
          {invitation.campaign.description}
        </p>

        <div className='flex items-center gap-2 mb-3'>
          <span className='text-sm font-medium text-brand-primary'>
            ${invitation.campaign.budget}
          </span>
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            • Invited {formatDate(invitation.createdAt)}
          </span>
        </div>

        <div className='flex flex-wrap gap-2 mb-4'>
          {invitation.campaign.platforms.map((platform) => (
            <span
              key={platform}
              className='text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full'
            >
              {platform}
            </span>
          ))}
        </div>

        <div className='flex items-center gap-3 mt-4'>
          <Button
            user='influencer'
            color='danger'
            variant='outlined'
            onClick={() => handleInvitationResponse('rejected')}
            disabled={loading}
            className='flex-1'
          >
            <FaTimesCircle className='mr-1' /> Decline
          </Button>
          <Button
            user='influencer'
            color='primary'
            onClick={() => handleInvitationResponse('accepted')}
            disabled={loading}
            className='flex-1'
          >
            <FaCheckCircle className='mr-1' /> Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
