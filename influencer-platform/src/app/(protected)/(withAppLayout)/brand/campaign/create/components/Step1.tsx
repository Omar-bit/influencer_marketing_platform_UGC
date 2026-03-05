import CardSelector, { Card } from '@/components/CardSelector/CardSelector';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import { CAMPAIGN_MODELS, SUPPORTED_SOCIAL_MEDIAS } from '@/utils/constants';
import Image from 'next/image';

export default function Step1({ campaign, handleSetCampaign }: any) {
  function setModel(value: any) {
    handleSetCampaign('model', value);
  }

  const campaignModels = CAMPAIGN_MODELS.map((model) => ({
    id: model.id,
    content: <Card header={model.title} body={model.description} />,
  }));

  return (
    <div className='space-y-2'>
      <h3 className='font-bold text-md text-brand-secondary'>
        Select your preferred campaign model
      </h3>
      <CardSelector
        userType='influencer'
        value={campaign.model}
        setValue={setModel}
        isMultiSelect={false}
        options={campaignModels}
      />
      <h3 className='font-bold text-md text-brand-secondary mt-4'>
        Campaign Goals (Optional)
      </h3>
      <div className='w-full mt-1 space-y-2'>
        <Input
          type='number'
          label='Reach Target'
          labelPosition='left'
          className={{
            container: 'flex flex-col sm:flex-row items-start sm:items-center',
            label: '!w-full sm:!w-[10%] !text-sm mb-1 sm:mb-0',
          }}
          value={campaign.reachTarget}
          placeholder='e.g. 100,000 impressions'
          onChange={(e) => handleSetCampaign('reachTarget', e.target.value)}
        />
        <Input
          type='number'
          label='Engagement Rate'
          labelPosition='left'
          className={{
            container: 'flex flex-col sm:flex-row items-start sm:items-center',
            label: '!w-full sm:!w-[10%] !text-sm mb-1 sm:mb-0',
          }}
          value={campaign.engagementRate}
          placeholder='e.g. 5%'
          onChange={(e) => handleSetCampaign('engagementRate', e.target.value)}
        />

        <Input
          type='number'
          label='Conversion Target'
          labelPosition='left'
          className={{
            container: 'flex flex-col sm:flex-row items-start sm:items-center',
            label: '!w-full sm:!w-[10%] !text-sm mb-1 sm:mb-0',
          }}
          value={campaign.conversionTarget}
          placeholder='e.g. 500 sales'
          onChange={(e) =>
            handleSetCampaign('conversionTarget', e.target.value)
          }
        />
        <TextArea
          onChange={(e) => handleSetCampaign('customGoal', e.target.value)}
          value={campaign.customGoal}
          label='Custom Goal'
          labelPosition='left'
          className={{
            container: 'flex flex-col sm:flex-row items-start sm:items-center',
            label: '!w-full sm:!w-[10%] !text-sm mb-1 sm:mb-0',
          }}
          placeholder='Define your own goal'
        />
      </div>
    </div>
  );
}
