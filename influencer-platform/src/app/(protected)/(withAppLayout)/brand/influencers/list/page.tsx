'use client';
import useGetInfluencersLists from '@/hooks/useGetInfluencersLists';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { FaPlus, FaSort } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/providers/themeContext';
import {
  createInfluencersList,
  deleteInfluencersList,
  updateInfluencersList,
} from '@/utils/api/handlers/influencersLists';

import {
  InfluencerListCard,
  EditListModal,
  DeleteListModal,
  ViewDetailsModal,
  AddMemberModal,
  CreateListModal,
  InfluencerListType,
} from './components';

export default function InfluencersListsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<InfluencerListType | null>(
    null
  );

  //@ts-ignore
  const brandId = session?.user?._id;
  const {
    data: existingLists,
    isLoading,
    refetch,
  } = useGetInfluencersLists(brandId, {
    enabled: !!brandId,
  });

  const filteredLists = existingLists
    ? existingLists.filter((list: any) => {
        if (searchTerm === '') return true;
        return list.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  const sortedLists = [...filteredLists].sort((a: any, b: any) => {
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const handleEditClick = (listId: string) => {
    const list = existingLists.find((l: any) => l._id === listId);
    if (list) {
      setSelectedList(list);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteClick = (listId: string) => {
    const list = existingLists.find((l: any) => l._id === listId);
    if (list) {
      setSelectedList(list);
      setIsDeleteModalOpen(true);
    }
  };

  const handleAddMemberClick = (listId: string) => {
    const list = existingLists.find((l: any) => l._id === listId);
    if (list) {
      setSelectedList(list);
      setIsAddMemberModalOpen(true);
    }
  };

  const handleViewDetailsClick = (listId: string) => {
    const list = existingLists.find((l: any) => l._id === listId);
    if (list) {
      setSelectedList(list);
      setIsViewDetailsModalOpen(true);
    }
  };

  const handleSaveList = async (name: string, influencerIds?: string[]) => {
    if (!selectedList) return;

    try {
      await updateInfluencersList(selectedList._id, {
        name,
        ...(influencerIds && { influencers: influencerIds }),
      });
      setSelectedList(null);

      setIsEditModalOpen(false);
      refetch();

      toast.success('List updated successfully');
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('An error occurred while updating the list');
      throw error;
    }
  };

  const handleDeleteList = async () => {
    if (!selectedList) return;

    try {
      await deleteInfluencersList(selectedList._id);

      toast.success('List deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('An error occurred while deleting the list');
      throw error;
    }
  };

  const handleAddMembers = async (selectedInfluencers: string[]) => {
    if (!selectedList) return;

    try {
      const existingInfluencerIds = selectedList.influencers.map(
        (inf) => inf._id
      );
      const allInfluencerIds = [
        ...new Set([...existingInfluencerIds, ...selectedInfluencers]),
      ];

      await updateInfluencersList(selectedList._id, {
        influencers: allInfluencerIds,
      });

      toast.success('Members added to list successfully');
      refetch();
    } catch (error) {
      console.error('Error adding members to list:', error);
      toast.error('An error occurred while adding members');
      throw error;
    }
  };

  const handleCreateList = async (name: string, influencerIds?: string[]) => {
    try {
      await createInfluencersList({
        name,
        influencers: influencerIds || [],
      });
      setIsCreateModalOpen(false);
      refetch();
      toast.success('List created successfully');
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('An error occurred while creating the list');
      throw error;
    }
  };

  return (
    <div className='p-3 sm:p-4 w-full dark:bg-gray-900'>
      <h1 className='text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-400 mb-4 sm:mb-6'>
        INFLUENCER LISTS MANAGEMENT
      </h1>

      <div className='flex flex-col sm:flex-row justify-between gap-3 mb-4 sm:mb-6'>
        <div className='relative w-full sm:max-w-md'>
          <Input
            type='search'
            placeholder='Search in lists...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={{
              container: 'w-full',
              input:
                'pl-8 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 w-full',
            }}
            leftIcon={
              <svg
                className='w-4 h-4 text-gray-500 dark:text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                ></path>
              </svg>
            }
          />
        </div>

        <div className='flex flex-wrap gap-2 items-center'>
          <div className='relative'>
            <select
              className='appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-4 pr-8 text-sm leading-tight focus:outline-none focus:border-purple-500 dark:text-gray-200'
              onChange={(e) => setSortBy(e.target.value)}
              value={sortBy}
            >
              <option value='createdAt'>Sort by Date</option>
              <option value='name'>Sort by Name</option>
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300'>
              <FaSort size={12} />
            </div>
          </div>

          <Button
            user='brand'
            color='primary'
            onClick={() => setIsCreateModalOpen(true)}
            className='flex items-center whitespace-nowrap'
          >
            <FaPlus className='mr-2' size={12} />
            <span>Add</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800 dark:border-purple-400'></div>
        </div>
      ) : !sortedLists || sortedLists.length === 0 ? (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 sm:p-8 text-center'>
          <p className='text-gray-600 dark:text-gray-300 mb-4'>
            No influencer lists found
          </p>
          <Button
            user='brand'
            color='primary'
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create your first list
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {sortedLists.map((list: InfluencerListType) => (
            <InfluencerListCard
              key={list._id}
              list={list}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onAddMember={handleAddMemberClick}
              onViewDetails={handleViewDetailsClick}
              isDark={isDark}
            />
          ))}
        </div>
      )}

      {/* Modal Components */}
      <EditListModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        list={selectedList}
        onSave={handleSaveList}
      />

      <DeleteListModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        list={selectedList}
        onConfirm={handleDeleteList}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        list={selectedList}
        onSave={handleAddMembers}
      />

      <ViewDetailsModal
        isOpen={isViewDetailsModalOpen}
        onClose={() => setIsViewDetailsModalOpen(false)}
        list={selectedList}
      />

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateList}
      />
    </div>
  );
}
