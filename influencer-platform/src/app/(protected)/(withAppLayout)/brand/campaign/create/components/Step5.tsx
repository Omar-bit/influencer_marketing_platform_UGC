import { useState, useEffect } from 'react';
import { SUPPORTED_SOCIAL_MEDIAS } from '@/utils/constants';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from 'react-select';
// import RadioButton from '@/components/ui/RadioButton';
// import {  } from '@/utils/api/handlers/influencers';

import { useSession } from 'next-auth/react';
import useGetInfluencersLists from '@/hooks/useGetInfluencersLists';
import CardSelector, { Card } from '@/components/CardSelector/CardSelector';

export default function Step5({ campaign, handleSetCampaign }: any) {
  const { data: session } = useSession();
  //@ts-ignore
  const userId = session?.user?._id;
  const [influencerLists, setInfluencerLists] = useState<any[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const { data: allInfluencerLists } = useGetInfluencersLists(userId, {
    enabled: !!userId,
  });
  const supportedPlatforms = SUPPORTED_SOCIAL_MEDIAS.map(
    ({ svg: Icon, name, background, disabled = false }, index) => ({
      id: String(index),
      disabled,
      content: (
        <Card
          disabled={disabled}
          className={{ container: 'items-center' }}
          header={
            <header>
              <div className='flex items-center justify-center gap-2'>
                <Icon className='size-8' />
                <h3 className='text-sm font-semibold'>{name}</h3>
              </div>
            </header>
          }
          body={null}
        />
      ),
    })
  );

  // Fetch influencer lists when component mounts
  useEffect(() => {
    if (allInfluencerLists) {
      const options = allInfluencerLists?.map((list: any) => ({
        value: list._id,
        label: list.name,
        influencers: list.influencers,
      }));
      setInfluencerLists(options);
    }
  }, [allInfluencerLists]);

  const [localIsPublic, setLocalIsPublic] = useState(campaign.isPublic);

  useEffect(() => {
    setLocalIsPublic(campaign.isPublic);
  }, [campaign.isPublic]);

  const handleCampaignVisibilityChange = (isPublic: boolean) => {
    setLocalIsPublic(isPublic);
    handleSetCampaign('isPublic', isPublic);

    if (isPublic) {
      handleSetCampaign('targetedInfluencerLists', []);
    }
  };

  const handleInfluencerListsChange = (selectedOptions: any) => {
    const selectedListIds = selectedOptions.map((option: any) => option.value);
    handleSetCampaign('targetedInfluencerLists', selectedListIds);
  };
  function setPlatforms(value: any) {
    handleSetCampaign('platforms', value);
  }

  // Custom styles for the Select component
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: '20px',
      borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
      '&:hover': {
        borderColor: '#6366f1',
      },
      padding: '4px 8px',
      backgroundColor: '#ffffff',
      transition: 'all 0.2s ease',
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#6366f1'
        : state.isFocused
        ? '#f1f5f9'
        : 'transparent',
      color: state.isSelected ? 'white' : '#334155',
      padding: '10px 16px',
      cursor: 'pointer',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#f1f5f9',
      borderRadius: '8px',
      padding: '2px',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#334155',
      fontWeight: 500,
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#64748b',
      '&:hover': {
        backgroundColor: '#e2e8f0',
        color: '#ef4444',
      },
      borderRadius: '6px',
    }),
  };

  return (
    <div>
      <h3 className='font-bold text-md text-brand-secondary'>
        CAMPAIGN AUDIENCE AND CONTENT REQUIREMENTS
      </h3>
      <div className='w-full space-y-3'>
        <CardSelector
          userType='influencer'
          value={campaign.platforms}
          setValue={setPlatforms}
          isMultiSelect={true}
          options={supportedPlatforms}
        />
        <Input
          type='number'
          label='Number of Influencers'
          value={campaign.nbrOfInfluencers}
          placeholder='Enter number of influencers'
          labelPosition='left'
          onChange={(e) =>
            handleSetCampaign('nbrOfInfluencers', e.target.value)
          }
          className={{
            container: 'flex flex-col sm:flex-row items-start sm:items-center',
            input: 'border !border-brand-secondary rounded-[20px]',
            label: 'w-full sm:!w-[20%] !text-sm mb-1 sm:mb-0',
          }}
        />

        <TextArea
          label='Content Requirements'
          value={campaign.contentRequirements}
          placeholder='Add specific requirements for influencers content'
          labelPosition='left'
          onChange={(e) =>
            handleSetCampaign('contentRequirements', e.target.value)
          }
          className={{
            container: 'flex flex-col sm:flex-row items-start sm:items-start',
            textarea: 'border !border-brand-secondary rounded-[20px]',
            label: 'w-full sm:!w-[20%] !text-sm mb-1 sm:mb-0',
          }}
        />

        <h3 className='text-brand-primary font-bold text-xl mt-6'>
          Campaign Visibility
        </h3>

        <div className='space-y-4'>
          <div
            className={`flex items-center p-4 rounded-lg transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
              localIsPublic
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                : ''
            }`}
            onClick={() => handleCampaignVisibilityChange(true)}
          >
            <div className='relative mr-4'>
              <input
                type='radio'
                id='public-campaign'
                checked={localIsPublic}
                onChange={() => handleCampaignVisibilityChange(true)}
                className='appearance-none w-5 h-5 border border-gray-300 dark:border-gray-600 rounded-full checked:border-brand-primary checked:border-4 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary'
              />
            </div>
            <div className='flex-1'>
              <label
                htmlFor='public-campaign'
                className='block font-medium text-gray-800 dark:text-gray-200'
              >
                Public Campaign
              </label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Any influencer can apply to participate in this campaign.
              </p>
            </div>
          </div>

          <div
            className={`flex items-center p-4 rounded-lg transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
              !localIsPublic
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                : ''
            }`}
            onClick={() => handleCampaignVisibilityChange(false)}
          >
            <div className='relative mr-4'>
              <input
                type='radio'
                id='private-campaign'
                checked={!localIsPublic}
                onChange={() => handleCampaignVisibilityChange(false)}
                className='appearance-none w-5 h-5 border border-gray-300 dark:border-gray-600 rounded-full checked:border-brand-primary checked:border-4 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary'
              />
            </div>
            <div className='flex-1'>
              <label
                htmlFor='private-campaign'
                className='block font-medium text-gray-800 dark:text-gray-200'
              >
                Private Campaign
              </label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Only send invitations to specific influencer groups.
              </p>
            </div>
          </div>

          {!localIsPublic && (
            <div className='pl-6 border-l-2 border-gray-200 dark:border-gray-700 mt-4'>
              <div className='mb-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Select Influencer Lists
                </label>
                <div className='relative'>
                  {isLoadingLists ? (
                    <div className='flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400'>
                      <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-brand-primary'></div>
                      <span>Loading your influencer lists...</span>
                    </div>
                  ) : influencerLists.length === 0 ? (
                    <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md'>
                      <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                        You don't have any influencer lists yet. Create lists in
                        your dashboard before creating a private campaign.
                      </p>
                    </div>
                  ) : (
                    <Select
                      isMulti
                      name='influencerLists'
                      options={influencerLists}
                      className='basic-multi-select'
                      classNamePrefix='select'
                      placeholder='Select influencer lists...'
                      onChange={handleInfluencerListsChange}
                      value={influencerLists.filter((list) =>
                        campaign.targetedInfluencerLists?.includes(list.value)
                      )}
                      styles={selectStyles}
                    />
                  )}
                </div>
                {!isLoadingLists &&
                  influencerLists.length > 0 &&
                  campaign.targetedInfluencerLists?.length > 0 && (
                    <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                      {campaign.targetedInfluencerLists.reduce(
                        (total: number, listId: string) => {
                          const list = influencerLists.find(
                            (l) => l.value === listId
                          );
                          return total + (list?.influencers?.length || 0);
                        },
                        0
                      )}{' '}
                      influencers will be invited to this campaign
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
