'use client';
import useGetBookMarkedCampaigns from '@/hooks/useGetBookMarkedCampaigns';
import React from 'react';
import Campaign from '../../opportunities/Campaign';

function MarkedCamapaignsPage() {
  const {
    data: bookmarkedCampaigns,
    refetch,
    isLoading,
  } = useGetBookMarkedCampaigns();
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <svg
          className='animate-spin h-10 w-10 text-gray-200'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          ></circle>
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12zm2.5-1h9a2.5 2.5 0 1 1 0 5h-9a2.5 2.5 0 1 1 0-5z'
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      <h1 className='text-2xl font-bold mb-6'>Bookmarked Campaigns</h1>

      {bookmarkedCampaigns?.length === 0 ? (
        <div className='text-center py-10'>
          <p className='text-gray-600 dark:text-gray-400'>
            You haven't bookmarked any campaigns yet.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {bookmarkedCampaigns?.map((campaign: any) => (
            <Campaign
              key={campaign._id}
              campaign={{
                ...campaign,
                isSaved: true,
              }}
              showStatus={false}
              onBookmark={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MarkedCamapaignsPage;
