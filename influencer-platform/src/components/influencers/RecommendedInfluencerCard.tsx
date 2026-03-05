import React from 'react';
import Image from 'next/image';
import { FiUserPlus, FiCheck } from 'react-icons/fi';
import Button from '@/components/ui/button';

type RecommendedInfluencerCardProps = {
  influencer: any;
  isSelected: boolean;
  onToggleSelect: (influencerId: string) => void;
};

const RecommendedInfluencerCard = ({
  influencer,
  isSelected,
  onToggleSelect,
}: RecommendedInfluencerCardProps) => {
  return (
    <div
      className={`relative rounded-lg overflow-hidden border ${
        isSelected
          ? 'border-brand-primary dark:border-brand-primary'
          : 'border-gray-200 dark:border-gray-700'
      } shadow-md transition-all hover:shadow-lg bg-white dark:bg-gray-800`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className='absolute top-2 right-2 bg-brand-primary rounded-full p-1.5'>
          <FiCheck className='text-white' />
        </div>
      )}

      <div className='p-4'>
        {/* Header with avatar and name */}
        <div className='flex items-center mb-3'>
          <div className='relative w-12 h-12 rounded-full overflow-hidden mr-3 border border-gray-200 dark:border-gray-700'>
            {influencer.profilePicture ? (
              <Image
                src={influencer.profilePicture}
                alt={influencer.name || 'Influencer profile'}
                layout='fill'
                objectFit='cover'
              />
            ) : (
              <div className='w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
                <span className='text-gray-500 dark:text-gray-400 text-xl font-bold'>
                  {(influencer.name || 'User').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-white'>
              {influencer.name}
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              @
              {influencer.username ||
                influencer.name?.toLowerCase().replace(/\s/g, '')}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className='grid grid-cols-3 gap-2 mb-3'>
          {influencer.socialMedia?.map((platform: any, index: number) => (
            <div
              key={index}
              className='text-center bg-gray-50 dark:bg-gray-700 p-2 rounded-md'
            >
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {platform.platform}
              </p>
              <p className='font-semibold text-gray-900 dark:text-white'>
                {formatNumber(platform.metrics?.followers || 0)}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                followers
              </p>
            </div>
          ))}
        </div>

        {/* Niche tags */}
        <div className='flex flex-wrap gap-1 mb-3'>
          {influencer.niches?.map((niche: string, index: number) => (
            <span
              key={index}
              className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full'
            >
              {niche}
            </span>
          ))}
        </div>

        {/* Location */}
        {influencer.location && (
          <p className='text-sm text-gray-500 dark:text-gray-400 mb-3'>
            📍 {influencer.location}
          </p>
        )}

        {/* Action button */}
        <Button
          onClick={() => onToggleSelect(influencer._id)}
          variant={isSelected ? 'outlined' : 'filled'}
          className='w-full'
        >
          {isSelected ? (
            'Remove'
          ) : (
            <span className='flex items-center justify-center gap-2'>
              <FiUserPlus /> Select Influencer
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default RecommendedInfluencerCard;
