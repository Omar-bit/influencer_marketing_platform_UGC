'use client';
import CampaignDetails from '@/components/campaigns/CampaignDetails';
import Badge from '@/components/ui/Badge';
import Seperator from '@/components/ui/Seperator';
import useBrandCampaigns from '@/hooks/useBrandCampaigns';
import {
  DEFAULT_CAMPAIGN_IMAGE,
  SUPPORTED_SOCIAL_MEDIAS,
} from '@/utils/constants';
import { formatDate, timeSince } from '@/utils/date';
import { BACKEND_URL } from '@/utils/secrets';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { deleteCampaign } from '@/utils/api/handlers/campaign';
import { FiTrash2 } from 'react-icons/fi';
import Modal from '@/components/modals/Modal';
import { CampaignCard } from '@/components/campaigns/CampaignCard';

const tabs = [
  { value: 'pending', label: 'ongoing campaign' },
  { value: 'closed', label: 'DONE' },
  // { value: 'review', label: 'Under reviewing' },
  { value: 'draft', label: 'Draft' },
  // { value: 'unpaid', label: 'Unpaid' },
];

export default function ManageCampaignPage() {
  const [activeTab, setActiveTab] = React.useState(tabs[2].value);
  const { data: session, status: userStatus } = useSession();
  const router = useRouter();
  // @ts-ignore
  const userId = session?.user?._id;

  const {
    isLoading,
    data: campaigns = [],
    error,
    refetch: refetchCampaigns,
  } = useBrandCampaigns(userId, { status: undefined, enabled: !!userId });

  const data = campaigns.filter(
    (campaign: any) => campaign.status === activeTab
  );

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await deleteCampaign(campaignId);
      toast.success('Campaign deleted successfully');
      refetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  useEffect(() => {
    if (error) {
      toast('Error fetching campaigns');
      console.log(error);
    }
  }, [error]);

  return (
    <div className='p-2 space-y-2 bg-[#f6f6f6] dark:bg-gray-900 w-full'>
      <h1 className='text-2xl text-brand-primary font-bold dark:text-brand-primary'>
        MANAGE CAMPAIGN
      </h1>
      {isLoading ? (
        <div className='flex justify-center items-center p-8'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary'></div>
        </div>
      ) : (
        <div className='space-y-2 flex-1 overflow-y-auto w-full'>
          <div className='p-0 m-0'>
            <div className='flex gap-x-5 items-center'>
              {tabs.map((tab) => (
                <button
                  className={`px-2 py-1 rounded-t-md text-sm font-semibold uppercase ${
                    activeTab === tab.value
                      ? 'influencer-primary-gradient text-white'
                      : 'text-[#8d8d8d] dark:text-gray-400'
                  } `}
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Seperator className='w-full' />
          </div>

          {data.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow'>
              <p className='text-gray-600 dark:text-gray-300'>
                No campaigns in this category
              </p>
              <Link
                href='/brand/campaign/create'
                className='mt-4 px-4 py-2 bg-brand-primary text-white rounded-md hover:opacity-90'
              >
                Create Campaign
              </Link>
            </div>
          ) : (
            <div className='flex flex-col md:flex-row md:flex-wrap w-full items-stretch justify-stretch gap-5 mt-2'>
              {data?.map((campaign: any, index: number) => {
                console.log('Campaign:', campaign);
                return (
                  <CampaignCard
                    key={index}
                    campaign={campaign}
                    onDeleteCampaign={handleDeleteCampaign}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
