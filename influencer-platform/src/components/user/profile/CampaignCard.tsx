import Button from '@/components/ui/button';
import { IoCalendar } from 'react-icons/io5';
type CampaignCardProps = {
  campaign: any;
};
export default function CampaignCard({ campaign }: CampaignCardProps) {
  const isActive = campaign.status === 'pending';
  return (
    <div
      key={campaign._id}
      className='campaign-card min-w-[100%] md:min-w-[400px] w-[20%] max-w-[500px] px-4 py-5'
      style={{
        border: '1px solid #eee',
        borderRadius: '8px',
        width: '300px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        position: 'relative',
      }}
    >
      {/* Status badge */}
      <header className='flex items-center justify-between w-full'>
        <h3>{campaign.name}</h3>
        <div
          style={{
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: isActive ? '#e6f7ee' : '#f5f5f5',
            color: isActive ? '#00a854' : '#808080',
          }}
        >
          {isActive ? 'Active' : 'Completed'}
        </div>
      </header>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
        {campaign.description || 'No available description.'}
      </p>

      {isActive ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
          }}
        >
          {/* <div className='flex items-center text-[#929292] text-sm'>
            <IoCalendar className='mr-1 ' />
            <span>
              Ends in{' '}
              {Math.ceil(
                (new Date(campaign.endDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              days
            </span>
          </div> */}
          <Button
            color='primary'
            variant='ghost'
            className='text-xs shadow-none'
          >
            Apply Now
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
          }}
        >
          <div>
            <span style={{ color: '#666', fontSize: '14px' }}>
              Jan 2024 - Mar 2024
            </span>
          </div>
          <div
            style={{
              color: '#666',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>12 Influencers</span>
          </div>
        </div>
      )}
    </div>
  );
}
