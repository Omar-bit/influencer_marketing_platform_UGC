'use client';
import BrandLogin from '@/components/auth/BrandLogin';
import InfluencerLogin from '@/components/auth/InfluencerLogin';
import Image from 'next/image';
import influencerFlyer from '@/assets/auth/influencer.jpg';
import brandFlyer from '@/assets/auth/brand.png';
import Webtrendlogo from '@/assets/logo.svg';
import { useState } from 'react';
import Button from '@/components/ui/button';
import InfluencerSignup from '@/components/auth/InfluencerSignup';
import BrandSignup from '@/components/auth/BrandSignup';
import TypeSwitcher from '@/components/auth/TypeSwitcher';
export default function SignupPage() {
  const [isInfluencer, setIsInfluencer] = useState(true);
  return (
    <main className='w-full h-screen flex flex-col-reverse md:flex-row md:justify-center md:items-center relative overflow-hidden dark:bg-gray-900'>
      <TypeSwitcher
        isInfluencer={isInfluencer}
        setIsInfluencer={setIsInfluencer}
      />

      <div
        className={`bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-none w-full absolute bottom-0 md:static  md:flex-1 md:h-screen    p-3 md:px-6   max-h-[75vh] overflow-y-auto md:max-h-screen${
          isInfluencer ? 'hidden md:block' : ''
        }`}
      >
        <BrandSignup />
      </div>
      <div
        className={`bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-none w-full absolute bottom-0 md:static  md:flex-1 md:h-screen  p-3  md:px-6 max-h-[75vh] overflow-y-auto md:max-h-screen ${
          !isInfluencer ? 'hidden md:block' : ''
        }`}
      >
        <InfluencerSignup />
      </div>
      <div
        className={`md:absolute w-full md:w-[50%] top-0 left-0  z-[-20] md:z-20 h-full overflow-hidden transition-all duration-1000 ${
          !isInfluencer && 'md:translate-x-[100%]'
        }`}
      >
        <Image
          src={influencerFlyer}
          alt=''
          className={`absolute w-full h-[102%] transition-all duration-300 ${
            !isInfluencer && 'opacity-0'
          } `}
        />
        <Webtrendlogo
          className={` text-white size-12 md:size-52 absolute top-1 left-2 md:bottom-5 md:top-auto md:left-[50%] md:-translate-x-[50%]  z-40 ${
            !isInfluencer && 'hidden'
          }`}
        />

        <Image
          src={brandFlyer}
          alt=''
          className={`absolute w-full h-[105%] transition-all duration-300 ${
            isInfluencer && 'opacity-0'
          }`}
        />
      </div>
    </main>
  );
}
