import { Suspense } from 'react';
import CreateCampaign from './CreateCampaign';

export default async function CampaignCreationPage() {
  return (
    <Suspense
      fallback={
        <div className='flex justify-center items-center p-8'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary'></div>
          <p className='ml-2'>Loading...</p>
        </div>
      }
    >
      <CreateCampaign />
    </Suspense>
  );
}
