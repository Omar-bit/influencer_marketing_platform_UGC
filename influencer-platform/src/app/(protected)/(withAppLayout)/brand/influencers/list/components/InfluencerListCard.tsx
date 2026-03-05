import React from 'react';
import Image from 'next/image';
import { IoMdPeople } from 'react-icons/io';
import Button from '@/components/ui/button';
import { BACKEND_URL } from '@/utils/secrets';
import { formatDate } from '@/utils/date';

export interface InfluencerType {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface InfluencerListType {
  _id: string;
  name: string;
  createdAt: string;
  influencers: InfluencerType[];
}

interface InfluencerListCardProps {
  list: InfluencerListType;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddMember: (id: string) => void;
  onViewDetails: (id: string) => void;
  isDark: boolean;
}

const InfluencerListCard: React.FC<InfluencerListCardProps> = ({
  list,
  onEdit,
  onDelete,
  onAddMember,
  onViewDetails,
  isDark,
}) => {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 overflow-hidden'>
      <div
        className={`${
          isDark
            ? 'bg-gradient-to-r from-purple-900 to-pink-800'
            : 'bg-gradient-to-r from-purple-600 to-pink-500'
        } p-3 text-white`}
      >
        <div className='flex flex-wrap items-center gap-2'>
          <h2 className='text-lg font-semibold'>{list.name}</h2>
          <div className='flex items-center gap-1 text-xs bg-white bg-opacity-20 dark:bg-opacity-30 px-2 py-1 rounded'>
            <IoMdPeople className='size-4 sm:size-5' />
            <span>
              {list.influencers.length} Influencer
              {list.influencers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <p className='text-xs opacity-90 mt-1'>
          Created on {formatDate(list.createdAt)}
        </p>
      </div>

      <div className='p-3 sm:p-4'>
        <h3 className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
          Team Members
        </h3>
        <div className='flex flex-wrap gap-2 mb-4 items-center'>
          {list.influencers.slice(0, 3).map((influencer: InfluencerType) => (
            <div
              key={influencer._id}
              className='flex items-center bg-gray-100 dark:bg-gray-700 rounded-full pl-1 pr-3 py-1'
            >
              <div className='w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden mr-2'>
                {influencer.profilePicture ? (
                  <Image
                    src={`${BACKEND_URL}/uploads/${influencer.profilePicture}`}
                    alt={influencer.name}
                    width={32}
                    height={32}
                    className='object-cover w-full h-full'
                  />
                ) : (
                  <div className='bg-gray-300 dark:bg-gray-600 w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300'>
                    {influencer.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className='text-xs font-medium dark:text-gray-200 truncate max-w-[100px] sm:max-w-none'>
                {influencer.name}
              </span>
            </div>
          ))}
          {list?.influencers?.length - 3 > 0 && (
            <div className='flex items-center justify-center rounded-full text-xs sm:text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'>
              <span>+{list?.influencers?.length - 3} More</span>
            </div>
          )}
        </div>

        <div className='flex flex-col sm:flex-row justify-between gap-3 border-t w-full pt-3 border-gray-200 dark:border-gray-700'>
          <div className='flex flex-wrap gap-2'>
            <Button
              user='brand'
              color='primary'
              variant='outlined'
              onClick={() => onEdit(list._id)}
              className='text-xs py-1.5'
            >
              Edit
            </Button>
            <Button
              user='influencer'
              color='primary'
              variant='outlined'
              onClick={() => onDelete(list._id)}
              className='text-xs py-1.5'
            >
              Delete
            </Button>
            <Button
              user='brand'
              variant='outlined'
              color='secondary'
              onClick={() => onAddMember(list._id)}
              className='text-xs py-1.5'
            >
              Add Member
            </Button>
          </div>
          <Button
            user='influencer'
            color='primary'
            onClick={() => onViewDetails(list._id)}
            className='text-xs py-1.5 px-4 rounded-full'
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfluencerListCard;
