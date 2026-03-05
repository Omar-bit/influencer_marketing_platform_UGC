import Campaign from './Campaign';

const CampaignGrid = ({ campaigns }: { campaigns: any[] }) => (
  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-2 sm:p-4 mt-2 gap-3 sm:gap-5'>
    {campaigns.length > 0 ? (
      campaigns.map((campaign: any) => (
        <Campaign
          key={campaign._id}
          campaign={{
            ...campaign,
            service: campaign.service || 'Service',
            location: campaign.location || 'Location',
          }}
          showImage={false}
          showStatus={false}
        />
      ))
    ) : (
      <div className='col-span-full flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow text-center'>
        <p className='text-gray-600 dark:text-gray-300 mb-4'>
          No campaigns found in this category
        </p>
      </div>
    )}
  </div>
);

export default CampaignGrid;
