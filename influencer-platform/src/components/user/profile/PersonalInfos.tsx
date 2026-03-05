import React from 'react';
import ContentCard, { InfoItem } from '@/components/shared/ContentCard';

type PersonalInfosProps = { profile: any };

function PersonalInfos({ profile }: PersonalInfosProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const personIcon = (
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
        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
      />
    </svg>
  );

  return (
    <ContentCard title='Personal Information' icon={personIcon}>
      <InfoItem
        label='Gender'
        value={
          profile.gender === 'M'
            ? 'Male'
            : profile.gender === 'F'
            ? 'Female'
            : 'N/A'
        }
      />
      <InfoItem
        label='Birth Date'
        value={formatDate(profile.dateOfBirth) || 'N/A'}
      />
      <InfoItem
        label='Languages'
        value={profile.spokenLanguages?.join(', ') || 'N/A'}
      />
    </ContentCard>
  );
}

export default PersonalInfos;
