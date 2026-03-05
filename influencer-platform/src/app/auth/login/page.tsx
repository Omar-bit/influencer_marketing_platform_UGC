'use client';
import UnifiedLogin from '@/components/auth/UnifiedLogin';
import Image from 'next/image';
import influencerFlyer from '@/assets/auth/influencer.jpg';
import Webtrendlogo from '@/assets/logo.svg';

export default function LoginPage() {
  return (
    <main className='w-full h-screen flex md:flex-row md:justify-center md:items-center relative overflow-hidden dark:bg-gray-900'>
      {/* Login Form Section */}
      <div className='bg-white dark:bg-gray-800 w-full md:w-1/2 h-full md:py-6 md:px-8 flex items-center justify-center'>
        <UnifiedLogin />
      </div>

      {/* Background Image Section */}
      <div className='hidden md:block md:w-1/2 h-full relative overflow-hidden'>
        <Image
          src={influencerFlyer}
          alt='WebTrend Platform'
          className='absolute w-full h-full object-fill'
        />
        <div className='absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20'></div>
        <Webtrendlogo className='text-white size-20 absolute bottom-8 left-1/2 -translate-x-1/2' />
      </div>
    </main>
  );
}
