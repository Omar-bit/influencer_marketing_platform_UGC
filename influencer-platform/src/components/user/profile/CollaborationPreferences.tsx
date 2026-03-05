import React from 'react';
import ContentCard, { InfoItem } from '@/components/shared/ContentCard';

type CollaborationPreferencesProps = { profile: any };

function CollaborationPreferences({ profile }: CollaborationPreferencesProps) {
  const collaborationIcon = (
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
        d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
      />
    </svg>
  );

  const formatBudget = (budget?: string | number) => {
    if (!budget) return 'Not specified';
    if (typeof budget === 'number') {
      return `$${budget.toLocaleString()}`;
    }
    return budget;
  };

  return (
    <ContentCard title='Collaboration Preferences' icon={collaborationIcon}>
      <InfoItem
        label='Collaboration Type'
        value={profile.collaborationType || 'Not specified'}
      />
      <InfoItem
        label='Preferred Industry'
        value={profile.preferredIndustry || 'Not specified'}
      />
      <InfoItem
        label='Budget Range'
        value={formatBudget(profile.minimumRates?.perReel?.[0])}
      />
      <InfoItem
        label='Availability'
        value={profile.availability || 'Available for projects'}
        valueClassName='text-green-500'
      />
      {profile.previousCollaborations && (
        <InfoItem
          label='Previous Collaborations'
          value={profile.previousCollaborations}
        />
      )}
    </ContentCard>
  );
}

export default CollaborationPreferences;
