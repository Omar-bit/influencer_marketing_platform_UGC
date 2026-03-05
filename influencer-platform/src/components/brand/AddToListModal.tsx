import React, { useState } from 'react';
import Button from '../ui/button';
import Input from '../ui/Input';
import Modal from '../modals/Modal';
import { IoMdClose } from 'react-icons/io';
import { useSession } from 'next-auth/react';
import useGetInfluencersLists from '@/hooks/useGetInfluencersLists';
import {
  addMembersToList,
  createInfluencersList,
} from '@/utils/api/handlers/influencersLists';
import { toast } from 'react-toastify';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedInfluencers: any[];
  onSave: () => void;
  onRemoveInfluencer: (id: string) => void;
}

const AddToListModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedInfluencers,
  onSave,
  onRemoveInfluencer,
}) => {
  if (!isOpen) return null;

  const { data: session } = useSession();
  //@ts-ignore
  const brandId = session?.user?._id;
  const { data: existingLists } = useGetInfluencersLists(brandId, {
    enabled: !!brandId,
  });

  const [listOption, setListOption] = useState<'existing' | 'new'>('existing');
  const [selectedListId, setSelectedListId] = useState<string | null>(
    existingLists?.length > 0 ? existingLists[0].id : null
  );
  const [newListName, setNewListName] = useState<string>('');
  const isSaveDisabled =
    (listOption === 'existing' && !selectedListId) ||
    (listOption === 'new' && newListName.trim() === '') ||
    selectedInfluencers?.length === 0;
  const handleRemoveInfluencer = (id: string) => {
    onRemoveInfluencer(id);
  };

  async function handleSave() {
    let data;
    try {
      if (listOption === 'existing') {
        const payload = {
          influencers: selectedInfluencers.map((influencer) => influencer._id),
        };
        if (!payload.influencers.length) {
          toast.error('you must select at least one influencer to add');
          return;
        }
        if (!selectedListId) {
          toast.error('you must select a list to add influencer');
          return;
        }
        data = await addMembersToList(selectedListId, payload);
        toast.success('influencers added to list successfully');
        onSave();
      } else {
        const payload = {
          influencers: selectedInfluencers.map((influencer) => influencer._id),
          name: newListName,
          brandId: brandId,
        };
        if (payload.influencers.length === 0) {
          toast.error('you must select at least one influencer to add');
          return;
        }
        if (!newListName) {
          toast.error('you must give the list a name');
          return;
        }

        data = await createInfluencersList(payload);
        toast.success('list created successfully');
        onSave();
      }
    } catch (err) {
      console.log(err);
      toast.error('something went wrong');
    } finally {
      console.log('submission data:', data);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Add Influencers to List'
      className={{
        header: 'combination-gradient ',
        headerTitle: '!text-white ',
        headerClose: '!text-white',
      }}
    >
      <div className='bg-white dark:bg-gray-800 rounded-lg max-w-md w-full px-6 py-2 relative'>
        <div className='mb-4'>
          <p className='text-sm font-medium mb-2 text-brand-primary'>
            Selected influencers:
          </p>
          <div className='space-y-2'>
            {selectedInfluencers.map((influencer) => (
              <div
                key={influencer._id}
                className='flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded'
              >
                <span className='text-sm'>{influencer.name}</span>
                <button
                  onClick={() => handleRemoveInfluencer(influencer._id)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <IoMdClose size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className='mb-4'>
          <p className='text-sm font-medium mb-2 text-brand-primary'>
            Add to Existing List:
          </p>
          <div className='space-y-2'>
            <div className='flex items-center'>
              <input
                type='radio'
                id='existing-list'
                name='list-option'
                checked={listOption === 'existing'}
                onChange={() => setListOption('existing')}
                className='mr-2 accent-brand-primary'
              />
              <label htmlFor='existing-list'>Add to Existing List</label>
            </div>

            {listOption === 'existing' && existingLists?.length > 0 && (
              <div className='ml-6 space-y-2' key='existing-lists'>
                {existingLists?.map((list: any, index: number) => (
                  <div key={index} className='flex items-center'>
                    <input
                      type='radio'
                      id={`list-${list.id}`}
                      name='list-selection'
                      checked={selectedListId === list._id}
                      onChange={() => setSelectedListId(list._id)}
                      className='mr-2 accent-brand-primary'
                    />
                    <label htmlFor={`list-${list._id}`}>{list.name}</label>
                  </div>
                ))}
              </div>
            )}

            <div className='flex items-center'>
              <input
                type='radio'
                id='new-list'
                name='list-option'
                checked={listOption === 'new'}
                onChange={() => setListOption('new')}
                className='mr-2 accent-brand-primary'
              />
              <label htmlFor='new-list'>Create New List</label>
            </div>

            {listOption === 'new' && (
              <div className='ml-6'>
                <p className='text-sm mb-1'>New List Name:</p>
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder='Enter list name...'
                  className={{
                    input: 'w-full',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-2'>
          <Button variant='outlined' onClick={onClose} className='px-4'>
            Cancel
          </Button>
          <Button
            user='brand'
            color='primary'
            variant='filled'
            onClick={handleSave}
            disabled={isSaveDisabled}
            className='px-4'
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddToListModal;
