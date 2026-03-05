import Banner from '@/components/Banner/Banner';
import InfluencersSearchContainer from '@/components/brand/InfluencersSearchContainer';

export default async function page() {
  return (
    <div className=' pt-3 space-y-2 '>
      <Banner isGradient variant='brand' className='p-4'>
        <h3 className='text-md text-brand-primary '>INFLUENCER DISCOVERY</h3>
        <h1 className='text-4xl tracking-widest font-extrabold dark:text-black'>
          Find the best influencers
        </h1>
        <p className='text-xl font-semibold text-influencer-secondary'>
          Not just any creators. The right ones
        </p>
      </Banner>
      <InfluencersSearchContainer />
    </div>
  );
}
