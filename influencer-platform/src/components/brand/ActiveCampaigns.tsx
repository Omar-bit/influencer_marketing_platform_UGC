'use client';
import useBrandCampaigns from '@/hooks/useBrandCampaigns';
import { SUPPORTED_SOCIAL_MEDIAS } from '@/utils/constants';
import { useSession } from 'next-auth/react';
import React from 'react';
import Seperator from '../ui/Seperator';
import { formatDate } from '@/utils/date';
import Image from 'next/image';
import Link from 'next/link';
import { BACKEND_URL } from '@/utils/secrets';

export default function ActiveCampaigns() {
  const { data: session } = useSession();
  //@ts-ignore
  const userId = session?.user?._id;
  const enabled = userId !== undefined && userId !== null;
  const { data, isLoading, error } = useBrandCampaigns(userId, {
    status: 'pending',
    enabled,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error fetching campaigns</div>;
  }
  return (
    <div className='p-2 w-full shadow-md space-y-1 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700'>
      <h1 className='font-bold text-lg dark:text-white'>ONGOING CAMPAIGN</h1>
      <div className='flex items-stretch gap-3 overflow-x-auto w-full md:max-w-[93vw] lg:max-w-[77vw] py-1'>
        {data?.map((campaign: any) => {
          console.log('Campaign:', campaign);

          return (
            <Campaign
              key={campaign._id}
              campaignId={campaign._id}
              {...campaign}
            />
          );
        })}
      </div>
    </div>
  );
}

function Campaign({
  campaignId,
  business,
  name,
  description,
  image,
  status,
  startDate,
  endDate,
  influencers,
  budget,
  platforms,
  country,
  productService,
  ecommerceCategory,
}: any) {
  return (
    <Link
      href={`/campaigns/${campaignId}`}
      className='min-w-[500px] p-2 drop-shadow-lg border rounded-3xl overflow-hidden bg-white dark:bg-gray-800 dark:border-gray-700 flex items-stretch justify-stretch relative cursor-pointer hover:opacity-85'
    >
      <div className='w-[95%] space-y-1'>
        <div className='flex flex-col'>
          <span className='font-bold text-black dark:text-white text-md p-0 m-0'>
            {name}
          </span>
          <span className='text-[#868686] dark:text-gray-400 text-sm'>
            {productService}
          </span>
        </div>
        <div className='flex items-center gap-1 my-1'>
          {platforms?.map((platform: string) => {
            const Icon = SUPPORTED_SOCIAL_MEDIAS.find(
              (social) => social.name.toLowerCase() === platform.toLowerCase()
            )?.svg;
            return (
              <div
                className='flex text-[#868686] dark:text-gray-300 items-center gap-1 bg-white dark:bg-gray-700 rounded-xl px-2 py-1 font-bold shadow-xl'
                key={platform}
              >
                {/* @ts-ignore */}
                <Icon className='size-3' />
                <span className='text-[10px]'>{platform.toUpperCase()}</span>
              </div>
            );
          })}
        </div>
        <div className='flex items-start gap-5 my-1'>
          <div className='flex items-start justify-start flex-col'>
            <h5 className='font-bold text-black dark:text-white text-[14px]'>
              INFLUENCERS
            </h5>
            <div className='flex items-center gap-2 mt-2'>
              {business.profilePicture ? (
                <Image
                  src={BACKEND_URL + '/uploads/' + business.profilePicture}
                  alt={business.name}
                  width={50}
                  height={50}
                  className='size-10 rounded-full'
                />
              ) : (
                <div className='size-10 bg-gray-600 rounded-full' />
              )}
              <div className='flex flex-col'>
                <span className='font-semibold text-sm dark:text-white'>
                  {business.name}
                </span>
                <span className='text-[#6B7280] dark:text-gray-400 text-sm'>
                  {country}
                </span>
              </div>
            </div>
          </div>
          <Seperator
            style='vertical'
            className='w-[1.5px] !h-11 !min-h-[30px] my-auto'
            type='neutral'
          />
          <div className='flex items-center justify-center flex-col'>
            <h5 className='font-bold text-black dark:text-white text-[14px]'>
              CATEGORY
            </h5>
            <div className='mt-2'>
              <span className='text-sm dark:text-gray-300'>
                {ecommerceCategory}
              </span>
            </div>
          </div>
        </div>
        <div className='flex items-center w-full justify-between mt-1'>
          {startDate && endDate && (
            <div className='text-[#868686] dark:text-gray-400 font-semibold'>
              {startDate && 'From ' + formatDate(startDate)}{' '}
              {endDate && 'To ' + formatDate(endDate)}
            </div>
          )}
          <span className='rounded-lg bg-influencer-secondary text-white font-bold px-2 py-1'>
            ONGOING
          </span>
        </div>
      </div>
      <div className='absolute right-0 top-0 w-[5%] h-[100%] bg-influencer-secondary'>
        <div className='flex flex-col gap-[2px] items-center justify-center w-full mt-4 cursor-pointer p-1 hidden'>
          <span className='bg-white size-1 rounded-full aspect-square'></span>
          <span className='bg-white size-1 rounded-full aspect-square'></span>
          <span className='bg-white size-1 rounded-full aspect-square'></span>
        </div>
      </div>
    </Link>
  );
}
