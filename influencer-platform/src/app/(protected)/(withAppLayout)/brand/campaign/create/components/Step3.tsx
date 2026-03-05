import Input from '@/components/ui/Input';
import Seperator from '@/components/ui/Seperator';
import { DEFAULT_CAMPAIGN_IMAGE } from '@/utils/constants';
import Image from 'next/image';
import CheckBox from './CheckBox';

export default function Step3({ campaign, handleSetCampaign, image }: any) {
  return (
    <div>
      <h3 className='font-bold text-md text-brand-secondary'>
        TIMELINE AND BUDGET
      </h3>
      <div className='w-full flex flex-col gap-2'>
        <div className='w-full flex flex-col sm:flex-row items-center gap-4 sm:gap-10'>
          <Image
            width={50}
            height={50}
            src={image || DEFAULT_CAMPAIGN_IMAGE}
            alt='campaign image'
            className='w-[80%] sm:w-[10%] aspect-square rounded-lg'
          />
          <div className='w-full px-2 font-bold space-y-1 py-3 text-center sm:text-left'>
            <h3 className='text-brand-primary text-xl'>{campaign?.name}</h3>
            <p className='text-[#909090] font-normal text-xs'>
              {campaign?.ecommerceCategory?.value}
            </p>
            <p className='text-[#909090] font-normal text-xs'>
              {campaign?.country}
            </p>
          </div>
        </div>
        <Seperator className='bg-[#ED4F59] !w-full my-1' />
        <div className='w-full space-y-2 mt-1'>
          {/* <h3 className='text-brand-primary text-lg font-bold'>
            Campaign Timeline
          </h3>
          <CheckBox
            handleClick={() =>
              handleSetCampaign('isSponsored', !campaign.isSponsored)
            }
            value={campaign.isSponsored}
            title='Sponsored Campaign'
            description='Enable to set specific start and end dates'
          />

          {campaign.isSponsored && (
            <div className='w-full flex flex-col sm:flex-row gap-2'>
              <Input
                type='date'
                label='Start Date'
                value={campaign.startDate}
                onChange={(e) => handleSetCampaign('startDate', e.target.value)}
                className={{
                  input:
                    'rounded-[20px] border !border-brand-secondary text-[14px] font-normal',
                  container: 'w-full',
                }}
              />
              <Input
                type='date'
                label='End Date'
                value={campaign.endDate}
                onChange={(e) => handleSetCampaign('endDate', e.target.value)}
                className={{
                  input:
                    'rounded-[20px] border !border-brand-secondary text-[14px] font-normal',
                  container: 'w-full',
                }}
              />
            </div>
          )} */}
          <h3 className='text-brand-primary font-bold text-xl'>
            Campaign Budget
          </h3>
          <Input
            type='number'
            labelPosition='left'
            value={campaign.budget}
            onChange={(e) => handleSetCampaign('budget', e.target.value)}
            label='Campaign Budget (TND)'
            className={{
              container:
                'flex flex-col sm:flex-row items-start sm:items-center',
              label: 'w-full sm:!w-[20%] !text-sm mb-1 sm:mb-0',
            }}
          />
          <p className='text-xs text-gray-500 mt-1'>
            This budget represents the amount to pay a single influencer for
            their content. The amount should be greater than 100 TND.
          </p>
          {campaign.budget && Number(campaign.budget) <= 100 && (
            <p className='text-xs text-red-500 mt-1'>
              Budget must be greater than 100 TND.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
