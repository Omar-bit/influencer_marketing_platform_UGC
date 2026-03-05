import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/modals/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import Image from 'next/image';
import { FaSearch } from 'react-icons/fa';
import { BACKEND_URL } from '@/utils/secrets';
import { InfluencerListType } from './InfluencerListCard';

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: InfluencerListType | null;
  onSave: (name: string, influencerIds?: string[]) => void;
}

const EditListModal: React.FC<EditListModalProps> = ({
  isOpen,
  onClose,
  list,
  onSave,
}) => {
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(false);
  const [influencersToKeep, setInfluencersToKeep] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (list) {
      setListName(list.name);
      setInfluencersToKeep(list.influencers.map((inf) => inf._id));
    }
  }, [list]);

  const handleRemoveInfluencer = (influencerId: string) => {
    setInfluencersToKeep((prev) => prev.filter((id) => id !== influencerId));
  };

  const handleSave = async () => {
    if (!listName.trim()) {
      toast.error('List name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await onSave(listName, influencersToKeep);
      onClose();
    } catch (error) {
      console.error('Error saving list:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInfluencers =
    list?.influencers.filter(
      (inf) =>
        inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Edit Influencer List'>
      <div className='space-y-4'>
        <Input
          label='List Name'
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder='Enter list name'
          className={{
            container: 'w-full',
          }}
        />

        {list && list.influencers.length > 0 && (
          <div className='mt-4 sm:mt-6'>
            <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Manage Influencers
            </h3>

            <Input
              type='search'
              placeholder='Search influencers...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={{
                container: 'w-full mb-3',
                input: 'pl-8 pr-4 py-2 rounded-md border',
              }}
              leftIcon={<FaSearch className='text-gray-500' />}
            />

            <div className='max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md'>
              {filteredInfluencers.length === 0 ? (
                <p className='text-center text-gray-500 dark:text-gray-400 p-4'>
                  {searchTerm
                    ? 'No matching influencers found'
                    : 'No influencers in this list'}
                </p>
              ) : (
                <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                  {filteredInfluencers.map((influencer) => (
                    <div
                      key={influencer._id}
                      className={`flex items-center justify-between p-3 ${
                        !influencersToKeep.includes(influencer._id)
                          ? 'bg-gray-100 dark:bg-gray-800 opacity-60'
                          : 'bg-white dark:bg-gray-700'
                      }`}
                    >
                      <div className='flex items-center gap-3 min-w-0'>
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

                      <Button
                        user='influencer'
                        color='danger'
                        variant='outlined'
                        onClick={() => handleRemoveInfluencer(influencer._id)}
                        className='text-xs p-1 min-h-0 h-8 ml-2 shrink-0'
                        disabled={!influencersToKeep.includes(influencer._id)}
                      >
                        {influencersToKeep.includes(influencer._id)
                          ? 'Remove'
                          : 'Removed'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {list.influencers.length !== influencersToKeep.length && (
              <p className='text-xs text-amber-600 dark:text-amber-400 mt-2'>
                {list.influencers.length - influencersToKeep.length}{' '}
                influencer(s) will be removed
              </p>
            )}
          </div>
        )}

        <div className='flex justify-end gap-2 mt-4'>
          <Button variant='outlined' onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            user='brand'
            color='primary'
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditListModal;
