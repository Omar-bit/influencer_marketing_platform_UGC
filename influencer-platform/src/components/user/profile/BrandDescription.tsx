import React from 'react';
import ContentCard, { InfoItem } from '@/components/shared/ContentCard';

type BrandDescriptionProps = { profile: any };

function BrandDescription({ profile }: BrandDescriptionProps) {
  const descriptionIcon = (
    <svg
      className='w-5 h-5 text-pink-500 mr-2 flex-shrink-0'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      />
    </svg>
  );

  return (
    <ContentCard title='About Us' icon={descriptionIcon}>
      <div className='text-gray-700 dark:text-gray-300 leading-relaxed'>
        {profile.description ? (
          <p>{profile.description}</p>
        ) : (
          <p className='text-gray-500 dark:text-gray-400 italic'>
            No description provided
          </p>
        )}
      </div>
    </ContentCard>
  );
}

export default BrandDescription;
