'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useGetCampaigns from '@/hooks/useGetCampaigns';
import useGetInfluencerApplications from '@/hooks/useGetInfluencerApplications';
import AppliedSubTabs, { appliedSubTabs } from './AppliedSubTabs';
import TabNavigation, { tabs } from './TabNavigation';
import FiltersSection, { sortOptions } from './FiltersSection';
import CampaignGrid from './CampaignGrid';

const LoadingSpinner = () => (
  <div className='flex justify-center items-center p-8'>
    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-influencer-primary'></div>
  </div>
);

export default function InfluencerOpportunitiesPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [activeSubTab, setActiveSubTab] = useState(appliedSubTabs[0].value);
  const [sortBy, setSortBy] = useState(sortOptions[0].value);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedNiche, setSelectedNiche] = useState('all');

  const { data: session, status: userStatus } = useSession();
  // @ts-ignore
  const userId = session?.user?._id;

  const { loading, data: campaigns = [], error } = useGetCampaigns();
  const { data: appliedCampaigns = [] } = useGetInfluencerApplications();

  const processData = () => {
    const campaignsToFilter =
      activeTab === 'available'
        ? campaigns
        : appliedCampaigns
            .filter((application: any) => {
              if (activeSubTab !== 'all') {
                return (
                  application.status.toLowerCase() ===
                  activeSubTab.toLowerCase()
                );
              }
              return true;
            })
            .map((application: any) => ({
              ...application.campaign,
              applicationStatus: application.status,
              proposal: application.proposal,
              appliedAt: application.createdAt,
            }));

    const filteredBySearch = campaignsToFilter.filter((campaign: any) => {
      if (searchTerm) {
        return campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });

    const filteredByPlatform = filteredBySearch.filter((campaign: any) => {
      if (selectedPlatform === 'all') {
        return true;
      }
      return (
        campaign.platforms &&
        campaign.platforms.some(
          (platform: string) =>
            platform.toLowerCase() === selectedPlatform.toLowerCase()
        )
      );
    });

    const filteredByNiche = filteredByPlatform.filter((campaign: any) => {
      if (selectedNiche === 'all') {
        return true;
      }
      return (
        campaign.ecommerceCategory &&
        campaign.ecommerceCategory.toLowerCase() === selectedNiche.toLowerCase()
      );
    });

    return [...filteredByNiche].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'lastUpdated':
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case 'firstUpdated':
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        case 'aToZ':
          return a.name.localeCompare(b.name);
        case 'zToA':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  };

  const sortedCampaigns = processData();

  useEffect(() => {
    if (error) {
      toast('Error fetching campaigns');
      console.log(error);
    }
  }, [error]);

  return (
    <div className='p-2 space-y-2 bg-[#f6f6f6] dark:bg-gray-900  w-full flex flex-col'>
      <h1 className='text-xl sm:text-lg text-[#404040] dark:text-gray-200 font-bold'>
        OPPORTUNITIES
      </h1>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className='w-full'>
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setActiveSubTab={setActiveSubTab}
            appliedCampaignsCount={appliedCampaigns.length}
          />

          <FiltersSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            selectedNiche={selectedNiche}
            setSelectedNiche={setSelectedNiche}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {activeTab === 'applied' && (
            <AppliedSubTabs
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              appliedCampaigns={appliedCampaigns}
            />
          )}

          <CampaignGrid campaigns={sortedCampaigns} />
        </div>
      )}
    </div>
  );
}
