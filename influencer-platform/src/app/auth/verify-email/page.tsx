import Image from 'next/image';
import influencerFlyer from '@/assets/auth/influencer.jpg';
import brandFlyer from '@/assets/auth/brand.png';
import Webtrendlogo from '@/assets/logo.svg';
import VerifyEmail from '@/components/auth/VerifyEmail';

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { for?: 'influencer' | 'brand'; email?: string };
}) {
  const { for: userType = 'influencer', email = '' } = searchParams;
  return (
    <div
      className={`w-full h-screen flex ${
        userType === 'brand' && 'flex-row-reverse'
      } justify-center overflow-hidden relative dark:bg-gray-900`}
    >
      <div className='flex-1 w-full md:max-w-[50%] h-screen relative overflow-hidden'>
        <Image
          src={influencerFlyer}
          alt='influencer'
          className={`w-full h-full ${userType === 'brand' && 'hidden'}`}
        />
        {userType === 'influencer' && (
          <Webtrendlogo
            className={`z-50 text-white size-12 md:size-52 absolute top-1 left-2 md:bottom-5 md:top-auto md:left-[50%] md:-translate-x-[50%] `}
          />
        )}
        <Image
          src={brandFlyer}
          alt='brand'
          className={`w-full h-full ${userType === 'influencer' && 'hidden'}`}
        />
      </div>
      <div className='flex-1 rounded-t-2xl md:rounded-none absolute bottom-0 left-0 bg-white dark:bg-gray-800 md:static w-full md:max-w-[50%] overflow-x-hidden px-5 py-10'>
        <VerifyEmail userType={userType} email={email} />
      </div>
    </div>
  );
}
