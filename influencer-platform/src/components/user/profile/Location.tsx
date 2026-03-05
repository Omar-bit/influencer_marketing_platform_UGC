import React from 'react';
import ContentCard, { InfoItem } from '@/components/shared/ContentCard';

type LocationProps = { profile: any };

function Location({ profile }: LocationProps) {
  const locationIcon = (
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
        d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
      />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
      />
    </svg>
  );

  return (
    <ContentCard title="Location & Availability" icon={locationIcon}>
      <InfoItem 
        label="Country/City" 
        value={profile.address?.city && profile.address?.country 
          ? `${profile.address.city}, ${profile.address.country}` 
          : 'N/A'
        } 
      />
      <InfoItem 
        label="Time Zone" 
        value={profile.address?.timeZone || 'GMT+1 (CET)'} 
      />
      <InfoItem 
        label="Availability" 
        value={profile.availability || 'Available for projects'} 
        valueClassName="text-green-500" 
      />
    </ContentCard>
  );
}

export default Location;
