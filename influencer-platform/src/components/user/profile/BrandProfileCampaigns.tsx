import { useState } from 'react';
import useBrandCampaigns from '@/hooks/useBrandCampaigns';
import CampaignCard from './CampaignCard';

export default function BrandProfileCampaigns({
  brandId,
}: {
  brandId: string;
}) {
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'previous'>(
    'all'
  );

  const { data: activeCampaigns } = useBrandCampaigns(brandId as string, {
    status: 'pending',
    enabled: true,
  });
  const { data: completedCampaigns } = useBrandCampaigns(brandId as string, {
    status: 'closed',
    enabled: true,
  });

  const filteredCampaigns =
    activeTab === 'all'
      ? [...(activeCampaigns || []), ...(completedCampaigns || [])]
      : activeTab === 'ongoing'
      ? activeCampaigns || []
      : completedCampaigns || [];

  return (
    <div className='  w-full  md:w-[65%] mx-auto px-4 flex flex-col items-center justify-center'>
      <div className='flex border-b border-b-[#eee] mb-6c w-full'>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            border: 'none',
            background: 'none',
            borderBottom:
              activeTab === 'all'
                ? '2px solid var(--influencer-primary)'
                : 'none',
            padding: '12px 16px',
            cursor: 'pointer',
            fontWeight: activeTab === 'all' ? 'bold' : 'normal',
            color:
              activeTab === 'all' ? 'var(--influencer-primary)' : '#929292',
          }}
        >
          All Campaigns
        </button>
        <button
          onClick={() => setActiveTab('ongoing')}
          style={{
            border: 'none',
            background: 'none',
            borderBottom:
              activeTab === 'ongoing'
                ? '2px solid var(--influencer-primary)'
                : 'none',
            padding: '12px 16px',
            cursor: 'pointer',
            fontWeight: activeTab === 'ongoing' ? 'bold' : 'normal',
            color:
              activeTab === 'ongoing' ? 'var(--influencer-primary)' : '#929292',
          }}
        >
          On Going Campaigns
        </button>
        <button
          onClick={() => setActiveTab('previous')}
          style={{
            border: 'none',
            background: 'none',
            borderBottom:
              activeTab === 'previous'
                ? '2px solid var(--influencer-primary)'
                : 'none',
            padding: '12px 16px',
            cursor: 'pointer',
            fontWeight: activeTab === 'previous' ? 'bold' : 'normal',
            color:
              activeTab === 'previous'
                ? 'var(--influencer-primary)'
                : '#929292',
          }}
        >
          Previous Campaigns
        </button>
      </div>
      <div className='flex    overflow-x-auto gap-2 items-center my-3 justify-center sm:justify-between w-full '>
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign: any) => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))
        ) : (
          <p>No campaigns available.</p>
        )}
      </div>
    </div>
  );
}
