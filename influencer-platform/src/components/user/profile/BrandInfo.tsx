import React from 'react';
import ContentCard, { InfoItem } from '@/components/shared/ContentCard';

type BrandInfoProps = { profile: any };

function BrandInfo({ profile }: BrandInfoProps) {
  const brandIcon = (
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
        d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0h6'
      />
    </svg>
  );

  const getIndustryDisplay = () => {
    const primary = profile.primaryNiche || 'Not specified';
    const secondary = profile.secondaryNiches;

    if (secondary && secondary.length > 0) {
      return `${primary} (${secondary.join(', ')})`;
    }
    return primary;
  };

  const getCompanySize = () => {
    const sizeMap: { [key: string]: string } = {
      Startup: 'Startup (1-10 employees)',
      Small: 'Small (11-50 employees)',
      Medium: 'Medium (51-200 employees)',
      Large: 'Large (201-1000 employees)',
      Enterprise: 'Enterprise (1000+ employees)',
    };
    return sizeMap[profile.field] || profile.field || 'Not specified';
  };

  return (
    <ContentCard title='Brand Information' icon={brandIcon}>
      <InfoItem label='Industry' value={getIndustryDisplay()} />
      <InfoItem label='Company Size' value={getCompanySize()} />
      <InfoItem
        label='Brand Tone'
        value={profile.brandTone || 'Not specified'}
      />{' '}
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

export default BrandInfo;
