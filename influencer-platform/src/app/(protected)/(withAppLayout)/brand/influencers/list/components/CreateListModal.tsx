import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/modals/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import Image from 'next/image';
import { FaSearch } from 'react-icons/fa';
import { BACKEND_URL } from '@/utils/secrets';
import { getInfluencers } from '@/utils/api/handlers/influencer';
import { InfluencerType } from './InfluencerListCard';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, influencerIds?: string[]) => void;
}

const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(false);
  const [influencers, setInfluencers] = useState<InfluencerType[]>([]);
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingInfluencers, setLoadingInfluencers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInfluencers();
      setListName('');
      setSelectedInfluencers([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchInfluencers = async () => {
    setLoadingInfluencers(true);
    try {
      const { data: response } = await getInfluencers();
      setInfluencers(response);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      toast.error('Failed to load influencers');
    } finally {
      setLoadingInfluencers(false);
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

  const handleSave = async () => {
    if (!listName.trim()) {
      toast.error('List name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await onSave(listName, selectedInfluencers);
      onClose();
      setListName('');
      setSelectedInfluencers([]);
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Create New Influencer List'>
      <div className='space-y-4'>
        <Input
          label='List Name'
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder='Enter list name'
          className={{
            container: 'w-full',
          }}
          required
        />

        <div className='mt-6'>
          <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Add Influencers (Optional)
          </h3>

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

          {loadingInfluencers ? (
            <div className='flex justify-center items-center h-40 mt-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-800 dark:border-purple-400'></div>
            </div>
          ) : (
            <div className='max-h-60 overflow-y-auto mt-4'>
              {filteredInfluencers.length === 0 ? (
                <p className='text-center text-gray-500 dark:text-gray-400 p-4'>
                  {searchTerm
                    ? 'No matching influencers found'
                    : 'No influencers available'}
                </p>
              ) : (
                <div className='space-y-2'>
                  {filteredInfluencers.map((influencer) => (
                    <div
                      key={influencer._id}
                      className={`flex items-center gap-3 p-2 rounded mb-2 cursor-pointer border ${
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
                        className='h-4 w-4 text-purple-600 rounded-sm border-gray-300 dark:border-gray-600 focus:ring-0'
                      />
                      <div className='w-8 h-8 rounded-full overflow-hidden'>
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
                      <div>
                        <p className='font-medium text-gray-800 dark:text-gray-200'>
                          {influencer.name}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          {influencer.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className='flex items-center justify-between mt-6'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {selectedInfluencers.length} influencer
            {selectedInfluencers.length !== 1 && 's'} selected
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outlined'
              onClick={() => {
                onClose();
                setListName('');
                setSelectedInfluencers([]);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              user='brand'
              color='primary'
              onClick={handleSave}
              disabled={loading || !listName.trim()}
            >
              {loading ? 'Creating...' : 'Create List'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateListModal;
