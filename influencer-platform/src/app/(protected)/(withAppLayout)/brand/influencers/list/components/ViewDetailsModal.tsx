import React from 'react';
import Modal from '@/components/modals/Modal';
import Button from '@/components/ui/button';
import Image from 'next/image';
import { BACKEND_URL } from '@/utils/secrets';
import { formatDate } from '@/utils/date';
import { InfluencerListType } from './InfluencerListCard';

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: InfluencerListType | null;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  isOpen,
  onClose,
  list,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`List Details: ${list?.name}`}
    >
      <div className='space-y-4'>
        <div className='mb-4'>
          <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            List Information
          </h3>
          <div className='bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700'>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              <span className='font-semibold'>Created on:</span>{' '}
              {list ? formatDate(list.createdAt) : ''}
            </p>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              <span className='font-semibold'>Total Members:</span>{' '}
              {list?.influencers.length || 0}
            </p>
          </div>
        </div>

        <div>
          <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Members
          </h3>
          <div className='max-h-64 overflow-y-auto'>
            {list?.influencers.length === 0 ? (
              <p className='text-gray-500 dark:text-gray-400 text-sm italic'>
                No members in this list
              </p>
            ) : (
              <div className='space-y-2'>
                {list?.influencers.map((influencer) => (
                  <div
                    key={influencer._id}
                    className='flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600'
                  >
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0'>
                      {influencer.profilePicture ? (
                        <Image
                          src={`${BACKEND_URL}/uploads/${influencer.profilePicture}`}
                          alt={influencer.name}
                          width={40}
                          height={40}
                          className='object-cover w-full h-full'
                        />
                      ) : (
                        <div className='bg-gray-300 dark:bg-gray-600 w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300'>
                          {influencer.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className='min-w-0'>
                      <p className='font-medium text-gray-800 dark:text-gray-200 truncate'>
                        {influencer.name}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                        {influencer.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end mt-4'>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewDetailsModal;
