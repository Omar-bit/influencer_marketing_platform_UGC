'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import { SUPPORTED_SOCIAL_MEDIAS } from '@/utils/constants';
import Seperator from '@/components/ui/Seperator';
import { BACKEND_URL } from '@/utils/secrets';
import Link from 'next/link';
import Table from '@/components/CustomTable/Table';
import Slider from '@/components/ui/Slider';
import Select from '@/components/ui/Select';
import AddToListModal from '@/components/brand/AddToListModal';
import { IoAdd } from 'react-icons/io5';
import useInfluencerRecommendations from '@/hooks/useInfluencerRecommendations';

const TABLE_COLUMNS = [
  {
    header: 'NAME',
    accessorKey: 'name',
    align: 'left',
    cell: (info: any) => {
      const influencer = info.row.original;
      return (
        <Link
          href={`/users/${influencer.id}`}
          className='flex items-center gap-2 cursor-pointer hover:opacity-80'
        >
          {influencer.profilePicture ? (
            <Image
              alt='profile'
              src={BACKEND_URL + '/uploads/' + influencer.profilePicture}
              width={50}
              height={50}
              className='size-8 rounded-full object-cover'
            />
          ) : (
            <div className='size-8 rounded-full bg-gray-500' />
          )}
          <div className='flex flex-col gap-1'>
            <span className='text-black dark:text-white font-semibold text-sm'>
              {info.getValue()}
            </span>
            <span className='text-xs text-gray-600 dark:text-gray-400'>
              {influencer.location || 'N/A'}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    header: 'CATEGORY',
    accessorKey: 'categories',
    align: 'center',
    cell: (info: any) => {
      const categories = info.getValue();
      return categories && categories.length > 0 ? (
        <div className='p-2 rounded-lg text-brand-primary bg-brand-primary_10 dark:bg-opacity-20'>
          {categories[0]}
        </div>
      ) : (
        'N/A'
      );
    },
  },
  {
    header: 'FOLLOWERS',
    accessorKey: 'followers',
    align: 'center',
    cell: (info: any) => {
      const followers = info.getValue();
      return followers ? followers.toLocaleString() : 'N/A';
    },
  },
  {
    header: 'ENGAGEMENT RATE',
    accessorKey: 'engagement',
    align: 'center',
    cell: (info: any) => {
      return info.getValue() ? `${info.getValue().toFixed(1)}%` : 'N/A';
    },
  },
  {
    header: 'RATING',
    accessorKey: 'rating',
    align: 'center',
    cell: (info: any) => {
      const rating = info.getValue();
      if (!rating) return 'N/A';

      const filledStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const emptyStars = 5 - filledStars - (hasHalfStar ? 1 : 0);

      return (
        <div className='flex items-center justify-center gap-0.5'>
          {/* Filled stars */}
          {[...Array(filledStars)].map((_, i) => (
            <span key={`filled-${i}`} className='text-yellow-400'>
              ★
            </span>
          ))}
          {/* Half star */}
          {hasHalfStar && <span className='text-yellow-400'>☆</span>}
          {/* Empty stars */}
          {[...Array(emptyStars)].map((_, i) => (
            <span key={`empty-${i}`} className='text-gray-300'>
              ☆
            </span>
          ))}
          <span className='ml-1 text-xs text-gray-500'>
            ({rating.toFixed(1)})
          </span>
        </div>
      );
    },
  },
  {
    header: 'PLATFORMS',
    accessorKey: 'platforms',
    align: 'center',
    cell: (info: any) => {
      const platforms = info.getValue();
      if (!platforms || platforms.length === 0) return 'N/A';

      return (
        <div className='flex gap-1 justify-center'>
          {platforms.map((platform: string) => {
            const socialMedia = SUPPORTED_SOCIAL_MEDIAS.find(
              (sm) => sm.name.toLowerCase() === platform.toLowerCase()
            );

            if (!socialMedia) return null;

            return (
              <Image
                key={platform}
                src={socialMedia.icon}
                alt={platform}
                width={24}
                height={24}
                className='size-6'
              />
            );
          })}
        </div>
      );
    },
  },
];

const CATEGORIES = [
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'travel', label: 'Travel' },
  { value: 'food', label: 'Food' },
  { value: 'technology', label: 'Technology' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'business', label: 'Business' },
];

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'russian', label: 'Russian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'arabic', label: 'Arabic' },
];

export default function RecommendedInfluencersContainer() {
  // Filter states
  const [locationInput, setLocationInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [followersRange, setFollowersRange] = useState<[number, number]>([
    0, 1000000,
  ]);
  const [minRating, setMinRating] = useState<number>(0);

  // Search states
  const [searchParams, setSearchParams] = useState<any>({});

  // Table states
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data
  const {
    data: recommendationsData,
    loading,
    error,
  } = useInfluencerRecommendations(searchParams);
  console.log('Recommendations Data:', recommendationsData);

  const handlePlatformSelect = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleSearch = () => {
    const params: any = {};

    if (selectedCategories.length > 0) {
      params.categories = selectedCategories;
    }

    if (selectedLanguages.length > 0) {
      params.languages = selectedLanguages;
    }

    if (selectedPlatforms.length > 0) {
      params.platforms = selectedPlatforms;
    }

    if (locationInput) {
      params.location = locationInput;
    }

    if (followersRange[0] > 0) {
      params.minFollowers = followersRange[0];
    }

    if (followersRange[1] < 1000000) {
      params.maxFollowers = followersRange[1];
    }

    if (minRating > 0) {
      params.minRating = minRating;
    }

    setSearchParams(params);
  };

  const handleAddToList = () => {
    if (Object.keys(selectedRows).length === 0) {
      toast.warning('Please select at least one influencer');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSaveList = () => {
    setIsModalOpen(false);
    setSelectedRows({});
  };

  const handleRemoveInfluencer = (id: string) => {
    setSelectedRows((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const selectedInfluencers = (recommendationsData || []).filter(
    (influencer: any) => selectedRows[influencer.id]
  );

  useEffect(() => {
    if (error) {
      toast.error('Error fetching recommendations');
    }
  }, [error]);

  return (
    <div className='w-full shadow-sm space-y-4'>
      {/* Filters Section */}
      <div className='p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-md space-y-4'>
        <h2 className='text-lg font-semibold text-gray-800 dark:text-white'>
          Filter Recommendations
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {/* Location */}
          <Input
            label='LOCATION'
            placeholder='Search by location'
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className={{
              container: 'w-full',
              input:
                '!rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white',
              label: 'font-bold text-black dark:text-white',
            }}
          />

          {/* Categories */}
          <Select
            label='CATEGORIES'
            placeholder='Select categories'
            options={CATEGORIES}
            isMulti
            value={CATEGORIES.filter((cat) =>
              selectedCategories.includes(cat.value)
            )}
            setValue={(selected) => {
              setSelectedCategories(
                (selected as any[]).map((item) => item.value)
              );
            }}
            className={{
              container: 'w-full',
              label: 'font-bold text-black dark:text-white',
            }}
            styles={{
              control: {
                borderRadius: '0.75rem',
                backgroundColor: 'var(--gray-700)',
                borderColor: 'var(--gray-600)',
              },
            }}
          />

          {/* Languages */}
          <Select
            label='LANGUAGES'
            placeholder='Select languages'
            options={LANGUAGES}
            isMulti
            value={LANGUAGES.filter((lang) =>
              selectedLanguages.includes(lang.value)
            )}
            setValue={(selected) => {
              setSelectedLanguages(
                (selected as any[]).map((item) => item.value)
              );
            }}
            className={{
              container: 'w-full',
              label: 'font-bold text-black dark:text-white',
            }}
            styles={{
              control: {
                borderRadius: '0.75rem',
                backgroundColor: 'var(--gray-700)',
                borderColor: 'var(--gray-600)',
              },
            }}
          />
        </div>

        {/* Followers Range */}
        <div className='space-y-1'>
          <label className='font-bold text-black dark:text-white'>
            FOLLOWERS RANGE
          </label>
          <Slider
            range
            min={0}
            max={1000000}
            step={1000}
            defaultValue={[0, 1000000]}
            value={followersRange}
            onChange={(value) => setFollowersRange(value as [number, number])}
            tipFormatter={(value) => `${value?.toLocaleString() || 0}`}
          />
          <div className='flex justify-between text-sm text-gray-500 dark:text-gray-400'>
            <span>{followersRange[0].toLocaleString()}</span>
            <span>{followersRange[1].toLocaleString()}</span>
          </div>
        </div>

        {/* Minimum Rating */}
        <div className='space-y-1'>
          <label className='font-bold text-black dark:text-white'>
            MINIMUM RATING
          </label>
          <Slider
            min={0}
            max={5}
            step={0.5}
            defaultValue={0}
            value={minRating}
            onChange={(value) => setMinRating(value as number)}
            tipFormatter={(value) => `${value}`}
          />
          <div className='flex justify-between text-sm text-gray-500 dark:text-gray-400'>
            <span>0</span>
            <span>5</span>
          </div>
        </div>

        {/* Platforms */}
        <div className='space-y-2'>
          <label className='font-bold text-black dark:text-white'>
            PLATFORMS
          </label>
          <div className='flex flex-wrap items-center gap-3'>
            {SUPPORTED_SOCIAL_MEDIAS.map((socialMedia) => (
              <div
                key={socialMedia.name}
                className='flex flex-col items-center'
              >
                <Image
                  className={`w-12 h-9 p-0 m-0 box-border rounded-xl cursor-pointer hover:scale-105 transition-all duration-200 ${
                    selectedPlatforms.includes(socialMedia.name.toLowerCase())
                      ? 'border-4 border-brand-primary'
                      : ''
                  }`}
                  onClick={() =>
                    handlePlatformSelect(socialMedia.name.toLowerCase())
                  }
                  width={100}
                  src={socialMedia.icon}
                  alt={socialMedia.name}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <div className='flex justify-end'>
          <Button
            user='brand'
            color='primary'
            variant='filled'
            className='px-8'
            onClick={handleSearch}
          >
            Find Recommended Influencers
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className='space-y-2'>
        <div className='flex justify-between items-center p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-md'>
          {' '}
          <h2 className='text-lg font-semibold text-gray-800 dark:text-white'>
            {loading
              ? 'Finding recommendations...'
              : recommendationsData && recommendationsData.length > 0
              ? `Found ${recommendationsData.length} recommended influencers`
              : 'No recommendations found'}
          </h2>
          <Button
            onClick={handleAddToList}
            user='brand'
            color='primary'
            variant='filled'
            disabled={Object.keys(selectedRows).length === 0}
          >
            <div className='flex items-center gap-2'>
              <span className='flex items-center justify-center size-5 bg-white rounded-full'>
                <IoAdd className='size-4 font-semibold text-brand-primary' />
              </span>
              {Object.keys(selectedRows).length > 0
                ? `Add ${Object.keys(selectedRows).length} to list`
                : 'Add to list'}
            </div>
          </Button>
        </div>

        {loading ? (
          <div className='flex justify-center items-center p-10'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary'></div>
          </div>
        ) : (
          <div className='w-full'>
            <Table
              columns={TABLE_COLUMNS}
              data={recommendationsData || []}
              selectedRows={selectedRows}
              onRowSelectionChange={setSelectedRows}
            />
          </div>
        )}
      </div>

      {/* Add to List Modal */}
      <AddToListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedInfluencers={selectedInfluencers}
        onSave={handleSaveList}
        onRemoveInfluencer={handleRemoveInfluencer}
      />
    </div>
  );
}
