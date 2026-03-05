import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/modals/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import Image from 'next/image';
import { FaSearch } from 'react-icons/fa';
import { BACKEND_URL } from '@/utils/secrets';
import { getInfluencers } from '@/utils/api/handlers/influencer';
import { InfluencerType, InfluencerListType } from './InfluencerListCard';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: InfluencerListType | null;
  onSave: (selectedInfluencers: string[]) => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  list,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [influencers, setInfluencers] = useState<InfluencerType[]>([]);
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [loadingInfluencers, setLoadingInfluencers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInfluencers();
    }
  }, [isOpen]);

  const fetchInfluencers = async () => {
    setLoadingInfluencers(true);
    try {
      const { data: response } = await getInfluencers();
      console.log('influencerssssss', response);

      // Filter out influencers that are already in the list
      const existingInfluencerIds =
        list?.influencers.map((inf) => inf._id) || [];
      const filteredInfluencers = response.filter(
        (inf: InfluencerType) => !existingInfluencerIds.includes(inf._id)
      );
      setInfluencers(filteredInfluencers);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      toast.error('Failed to load influencers');
    } finally {
      setLoadingInfluencers(false);
    }
  };

  const handleSave = async () => {
    if (selectedInfluencers.length === 0) {
      toast.error('Please select at least one influencer');
      return;
    }

    setLoading(true);
    try {
      onSave(selectedInfluencers);
      onClose();
      setSelectedInfluencers([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Error adding members:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInfluencer = (id: string) => {
    setSelectedInfluencers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredInfluencers = influencers.filter(
    (inf) =>
      inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inf.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Add Members to List'>
      <div className='space-y-4'>
        <Input
          type='search'
          placeholder='Search influencers...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={{
            container: 'w-full',
            input: 'pl-8 pr-4 py-2 rounded-md border',
          }}
          leftIcon={<FaSearch className='text-gray-500' />}
        />

        <div className='mt-4'>
          <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Select Influencers to Add
          </div>

          {loadingInfluencers ? (
            <div className='flex justify-center items-center h-32 sm:h-40'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-800 dark:border-purple-400'></div>
            </div>
          ) : filteredInfluencers.length === 0 ? (
            <p className='text-center text-gray-500 dark:text-gray-400 p-4'>
              {searchTerm
                ? 'No matching influencers found'
                : 'No influencers available to add'}
            </p>
          ) : (
            <div className='max-h-48 sm:max-h-60 overflow-y-auto'>
              {filteredInfluencers.map((influencer) => (
                <div
                  key={influencer._id}
                  className={`flex items-center gap-2 sm:gap-3 p-2 rounded mb-2 cursor-pointer border ${
                    selectedInfluencers.includes(influencer._id)
                      ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => toggleInfluencer(influencer._id)}
                >
                  <input
                    type='checkbox'
                    checked={selectedInfluencers.includes(influencer._id)}
                    onChange={() => toggleInfluencer(influencer._id)}
                    className='h-4 w-4 text-purple-600 rounded-sm border-gray-300 dark:border-gray-600 focus:ring-0 shrink-0'
                  />
                  <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0'>
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
                  <div className='min-w-0 flex-1'>
                    <p className='font-medium text-gray-800 dark:text-gray-200 text-sm truncate'>
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

        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {selectedInfluencers.length} influencer
            {selectedInfluencers.length !== 1 && 's'} selected
          </p>
          <div className='flex gap-2'>
            <Button variant='outlined' onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              user='brand'
              color='primary'
              onClick={handleSave}
              disabled={loading || selectedInfluencers.length === 0}
            >
              {loading ? 'Adding...' : 'Add to List'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddMemberModal;
