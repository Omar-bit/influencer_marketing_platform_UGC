import React from 'react';
import Button from '../ui/button';

function TypeSwitcher({
  isInfluencer,
  setIsInfluencer,
}: {
  isInfluencer: boolean;
  setIsInfluencer: (isInfluencer: boolean) => void;
}) {
  return (
    <Button
      onClick={() => setIsInfluencer(!isInfluencer)}
      className='absolute top-[1vh]  left-[50%] -translate-x-[50%] z-50 bg-white/70 shadow-lg rounded-[40px] flex items-center gap-1 p-1 md:p-2 !text-gray-500'
    >
      <div
        className={`p-2 uppercase text-xs md:text-md rounded-full  ${
          isInfluencer && 'influencer-primary-gradient text-white'
        }`}
      >
        For influencers
      </div>
      <div
        className={`p-2 uppercase text-xs md:text-md rounded-full  ${
          !isInfluencer && 'bg-brand-primary text-white'
        }`}
      >
        For brands
      </div>
    </Button>
  );
}

export default TypeSwitcher;
