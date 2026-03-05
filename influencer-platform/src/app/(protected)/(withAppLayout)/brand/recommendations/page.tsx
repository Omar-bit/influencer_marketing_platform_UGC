import Banner from '@/components/Banner/Banner';
import RecommendedInfluencersContainer from '@/components/brand/RecommendedInfluencersContainer';

export default function RecommendationsPage() {
  return (
    <div className='pt-3 space-y-2'>
      <Banner isGradient variant='brand' className='p-4'>
        <h3 className='text-md text-brand-primary'>
          INFLUENCER RECOMMENDATIONS
        </h3>
        <h1 className='text-4xl tracking-widest font-extrabold dark:text-black'>
          Recommended Influencers
        </h1>
        <p className='text-xl font-semibold text-influencer-secondary'>
          AI-powered recommendations for your brand
        </p>
      </Banner>
      <RecommendedInfluencersContainer />
    </div>
  );
}
