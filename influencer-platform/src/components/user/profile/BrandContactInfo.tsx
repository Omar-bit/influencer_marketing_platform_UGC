import React from 'react';
import ContentCard, { InfoItem } from '@/components/shared/ContentCard';

type BrandContactInfoProps = { profile: any };

function BrandContactInfo({ profile }: BrandContactInfoProps) {
  const contactIcon = (
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
        d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
      />
    </svg>
  );

  const formatPhone = (phone?: string) => {
    if (!phone) return 'Not provided';
    return phone;
  };

  const formatWebsite = (website?: string) => {
    if (!website) return 'Not provided';
    return website;
  };

  return (
    <ContentCard title='Contact Information' icon={contactIcon}>
      <InfoItem label='Email' value={profile.email || 'Not provided'} />
      <InfoItem label='Phone' value={formatPhone(profile.phone)} />
      {profile.secondPhone && (
        <InfoItem
          label='Alternative Phone'
          value={formatPhone(profile.secondPhone)}
        />
      )}{' '}
      <InfoItem
        label='Website'
        value={
          profile.website ? (
            <a
              href={
                profile.website.startsWith('http')
                  ? profile.website
                  : `https://${profile.website}`
              }
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 hover:underline cursor-pointer'
            >
              {profile.website}
            </a>
          ) : (
            'Not provided'
          )
        }
      />
    </ContentCard>
  );
}

export default BrandContactInfo;
