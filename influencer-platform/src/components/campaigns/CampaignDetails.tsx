import React from 'react';
import ContentCard, {
  ContentSection,
  BulletList,
} from '@/components/shared/ContentCard';

type CampaignDetailsProps = {
  campaign: any;
  /* {
    purpose: string;
    goals: string[];
    description: string;
  };*/
};

function CampaignDetails({ campaign }: CampaignDetailsProps) {
  const campaignIcon = (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='text-brand-primary dark:text-brand-primary'
    >
      <path
        d='M21 14H14V21H21V14Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10 14H3V21H10V14Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M21 3H14V10H21V3Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10 3H3V10H10V3Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );

  return (
    <ContentCard
      title='Campaign Details'
      icon={campaignIcon}
      headerVariant='separated'
    >
      <ContentSection title='Campaign Purpose'>
        <p className='text-sm text-gray-800 dark:text-gray-200'>
          {campaign?.purpose || 'No purpose provided'}
        </p>
      </ContentSection>

      <ContentSection title='Campaign Goals'>
        <BulletList
          items={
            campaign?.goals || [
              'Increase brand awareness',
              'Drive website traffic',
              'Generate leads',
              'Boost sales',
              'Enhance social media presence',
              'Improve customer engagement',
            ]
          }
        />
      </ContentSection>

      <ContentSection title='Campaign Description'>
        <p className='text-sm text-gray-800 dark:text-gray-200'>
          {campaign?.description ||
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
        </p>
      </ContentSection>
    </ContentCard>
  );
}

export default CampaignDetails;
