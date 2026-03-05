'use client';

import useRelevantInfluencers from '@/hooks/useRelevantInfluencers';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Input from '../ui/Input';
import Button from '../ui/button';
import { SUPPORTED_SOCIAL_MEDIAS } from '@/utils/constants';
import Seperator from '../ui/Seperator';
import { BACKEND_URL } from '@/utils/secrets';
import Link from 'next/link';
import Table from '../CustomTable/Table';
import Badge from '../ui/Badge';
import AddToListModal from './AddToListModal';
import useGetInfluencersLists from '@/hooks/useGetInfluencersLists';
import { useSession } from 'next-auth/react';
import { IoAdd } from 'react-icons/io5';

const TABLE_COLUMNS = [
  {
    header: 'NAME',
    accessorKey: 'name',
    align: 'left',
    cell: (info: any) => {
      return (
        <Link
          href={`/users/${info.row.original._id}`}
          className='flex items-center gap-2 cursor-pointer hover:opacity-80'
        >
          {info.row.original.profilePicture ? (
            <Image
              alt='profile'
              src={BACKEND_URL + '/uploads/' + info.row.original.profilePicture}
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
              {info.row.original.address?.country ?? 'N/A'}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    header: 'CATEGORY',
    accessorKey: 'primaryNiche',
    align: 'center',
    cell: (info: any) => {
      return info.getValue() ? (
        <div className='w-fit   p-2 rounded-lg text-brand-primary bg-brand-primary_10 dark:bg-opacity-20'>
          {info.getValue()}
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
      const followers = info.row.original.followers;
      return followers ? followers.toLocaleString() : 'N/A';
    },
  },
  {
    header: 'ENGAGEMENT RATE',
    accessorKey: 'engagementRate',
    align: 'center',
    cell: (info: any) => {
      return info.row.original.engagementRate
        ? `${info.row.original.engagementRate}%`
        : 'N/A';
    },
  },
  {
    header: 'RATING',
    accessorKey: 'averageRating',
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
          <span className='ml-1 text-xs text-gray-500'>({rating})</span>
        </div>
      );
    },
  },
];

export default function InfluencersSearchContainer() {
  const { data: influencersData, error, loading } = useRelevantInfluencers();
  const [countryInput, setCountryInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedSocialMedia, setSelectedSocialMedia] = useState('instagram');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedInfluencers = filteredData.filter(
    (influencer) => selectedRows[influencer._id]
  );

  function handleRemoveInfluencer(id: string) {
    setSelectedRows((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }

  function handleAddToList() {
    if (Object.keys(selectedRows).length === 0) {
      toast.warning('Please select at least one influencer');
      return;
    }
    setIsModalOpen(true);
  }

  function handleSaveList() {
    setIsModalOpen(false);
    setSelectedRows({});
  }

  function search() {
    setCountry(countryInput);
    setCategory(categoryInput);
  }

  useEffect(() => {
    if (influencersData) {
      const filtered = influencersData.filter((influencer: any) => {
        // Handle 'all' selection differently - no social media filtering
        if (selectedSocialMedia.toLowerCase() === 'all') {
          // For 'all', calculate total followers across all platforms
          const totalFollowers = influencer.socialMedia.reduce(
            (sum: number, platform: any) => sum + (platform.followers || 0),
            0
          );

          // Calculate average engagement rate (weighted by followers)
          let weightedEngagementSum = 0;
          let totalFollowersWithEngagement = 0;

          influencer.socialMedia.forEach((platform: any) => {
            if (platform.followers && platform.engagementRate) {
              weightedEngagementSum +=
                platform.followers * platform.engagementRate;
              totalFollowersWithEngagement += platform.followers;
            }
          });

          const avgEngagementRate =
            totalFollowersWithEngagement > 0
              ? weightedEngagementSum / totalFollowersWithEngagement
              : 0;

          influencer.followers = totalFollowers;
          influencer.engagementRate = avgEngagementRate
            ? parseFloat(avgEngagementRate.toFixed(2))
            : 0;

          // Only apply country and category filters
          const countryMatch = country
            ? influencer.address?.country
                ?.toLowerCase()
                .includes(country.toLowerCase())
            : true;

          const categoryMatch = category
            ? influencer.field
              ? influencer.field.toLowerCase().includes(category.toLowerCase())
              : false
            : true;

          return countryMatch && categoryMatch;
        }

        const socialMedia = influencer.socialMedia.find(
          (s: any) =>
            s.platform.toLowerCase() === selectedSocialMedia.toLowerCase()
        );

        const socialMediaMatch = !!socialMedia;

        if (socialMediaMatch) {
          influencer.followers = socialMedia.followers;
          influencer.engagementRate = socialMedia.engagementRate;
        }

        const countryMatch = country
          ? influencer.address?.country
              ?.toLowerCase()
              .includes(country.toLowerCase())
          : true;

        const categoryMatch = category
          ? influencer.field
            ? influencer.field.toLowerCase().includes(category.toLowerCase())
            : false
          : true;

        return socialMediaMatch && countryMatch && categoryMatch;
      });

      setFilteredData(filtered);
    }
  }, [influencersData, country, category, selectedSocialMedia]);

  useEffect(() => {
    if (error) {
      toast.error('Error fetching influencers');
    }
  }, [error]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='w-full shadow-sm space-y-2'>
      <div className='space-y-2'>
        <div className='flex items-end p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-md gap-2 justify-between w-full max-w-full'>
          <Input
            label='COUNTRY'
            placeholder='Search by country'
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            className={{
              container: 'flex-1 max-w-[30%]',
              input:
                '!rounded-3xl dark:bg-gray-700 dark:border-gray-600 dark:text-white',
              label: 'font-bold text-black dark:text-white',
            }}
          />
          <Input
            label='CATEGORY'
            placeholder='Search by category'
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            className={{
              container: 'flex-1 max-w-[30%]',
              input:
                '!rounded-3xl dark:bg-gray-700 dark:border-gray-600 dark:text-white',
              label: 'font-bold text-black dark:text-white',
            }}
          />
          <Button
            user='brand'
            color='primary'
            variant='filled'
            className='!px-10 max-w-[30%]'
            onClick={search}
          >
            Search
          </Button>
        </div>
        <nav className='flex items-center justify-between p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-md'>
          <div className='w-[50%] space-y-2 '>
            <div className='flex items-center gap-3 '>
              <div
                className={`flex flex-col justify-center items-center w-12 h-9 p-0 m-0 box-border rounded-xl cursor-pointer hover:scale-105 transition-all duration-200 ${
                  selectedSocialMedia.toLowerCase() === 'all' &&
                  'border-4 border-brand-primary'
                }`}
                onClick={() => setSelectedSocialMedia('all')}
              >
                <span>All</span>
              </div>
              {SUPPORTED_SOCIAL_MEDIAS.map((socialMedia) => (
                <div
                  key={socialMedia.name}
                  className='flex flex-col items-center'
                >
                  <Image
                    className={`w-12 h-9 p-0 m-0 box-border rounded-xl cursor-pointer hover:scale-105 transition-all duration-200 ${
                      selectedSocialMedia.toLowerCase() ===
                      socialMedia.name.toLowerCase()
                        ? 'border-4 border-brand-primary '
                        : ''
                    }`}
                    onClick={() => setSelectedSocialMedia(socialMedia.name)}
                    width={100}
                    src={socialMedia.icon}
                    alt={socialMedia.name}
                  />
                </div>
              ))}
            </div>
            <div className='relative flex items-center'>
              <div
                className={` h-[2.5px] bg-brand-primary absolute top-[50%]  translate-y-[-50%]  w-12 rounded-lg shadow transition-all duration-200`}
                style={{
                  left: `${
                    selectedSocialMedia.toLowerCase() === 'all'
                      ? '0'
                      : (SUPPORTED_SOCIAL_MEDIAS.findIndex(
                          (socialMedia) =>
                            socialMedia.name.toLowerCase() ===
                            selectedSocialMedia.toLowerCase()
                        ) +
                          1) *
                        3.75
                  }rem`,
                }}
              ></div>

              <Seperator type='neutral' className='h-[2.5px] !w-full' />
            </div>
          </div>
          <Button
            onClick={handleAddToList}
            user='brand'
            color='primary'
            variant='filled'
            disabled={Object.keys(selectedRows).length === 0}
          >
            <div className='flex items-center gap-2'>
              <span className='flex items-center justify-center size-5 bg-white rounded-full'>
                <IoAdd className=' size-4 font-semibold text-brand-primary' />
              </span>
              {Object.keys(selectedRows).length > 0
                ? `Add ${Object.keys(selectedRows).length} to list`
                : 'Add to list'}
            </div>
          </Button>
        </nav>
      </div>
      <div className='w-full'>
        <Table
          columns={TABLE_COLUMNS}
          data={filteredData}
          selectedRows={selectedRows}
          onRowSelectionChange={setSelectedRows}
        />
      </div>

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
