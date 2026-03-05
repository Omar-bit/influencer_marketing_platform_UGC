'use client';
import useGetCampaignContents from '@/hooks/useGetCampaignContents';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import Image from 'next/image';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { LuSearch } from 'react-icons/lu';
import { AiOutlineCheck } from 'react-icons/ai';
import { IoCloseOutline } from 'react-icons/io5';
import { BACKEND_URL } from '@/utils/secrets';
import Seperator from '@/components/ui/Seperator';
import Table, { columnHelper } from '@/components/CustomTable/Table';
import Modal from '@/components/modals/Modal';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
  payContent,
  updateContentStatus,
} from '@/utils/api/handlers/campaignContent';
import { useSession } from 'next-auth/react';
import TextArea from '@/components/ui/TextArea';

function CampaignContentsPage() {
  const { id: campaignId } = useParams();
  //@ts-ignore
  const userType = useSession()?.data?.user?.type; // influencer or business
  console.log('User Type:', userType);

  const {
    data: contents = [],
    isLoading,
    error,
    refetch: refreshContents,
  } = useGetCampaignContents(campaignId as string);

  const [activeTab, setActiveTab] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState({
    value: 'All Platforms',
    label: 'All Platforms',
  });

  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(
    null
  );
  const [contentToAction, setContentToAction] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState<string | null>(null);
  const [reasonModal, setReasonModal] = useState<boolean | null | string>(
    false
  );

  const handlePayContent = async (contentId: string) => {
    console.log('Paying content with ID:', contentId);
    try {
      const response = await payContent(contentId as string, {});
      console.log('payment ', response);
      if (response.success) {
        toast.success('Payment successful!');
        const { data } = response;
        const { payUrl } = data;
        if (payUrl) {
          window.location.href = payUrl;
        } else {
          toast.error('Payment URL not found. Please try again.');
        }
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('An error occurred while processing payment.');
    }
  };

  // Filter contents based on active tab, search term, and platform filter
  const filteredContents = contents.filter((content: any) => {
    // Filter by status tab
    const status = content.status.toUpperCase();

    if (activeTab === 'ACCEPTED' || activeTab === 'UNPAID') {
      if (status !== 'ACCEPTED') return false;
      if (
        (activeTab === 'UNPAID' && content.isPaid) ||
        (activeTab === 'ACCEPTED' && !content.isPaid)
      ) {
        return false;
      }
    } else if (status !== activeTab.toUpperCase()) {
      return false;
    }
    // Filter by search term
    if (
      searchTerm &&
      !content.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !content.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !content.application?.influencer?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by platform
    if (filterValue.value !== 'All Platforms') {
      const contentPlatforms = content.socialMediaPlatforms || [];
      if (
        !contentPlatforms.some(
          (platform: string) =>
            platform.toLowerCase() === filterValue.value.toLowerCase()
        )
      ) {
        return false;
      }
    }

    return true;
  });

  const handleUpdateContentStatus = async (
    contentId: string,
    status: 'accepted' | 'rejected',
    reason?: string | null | undefined
  ) => {
    try {
      setIsSubmitting(true);
      // Call the API function to update content status
      await updateContentStatus(contentId, status, reason);

      toast.success(
        `Content ${
          status === 'accepted' ? 'accepted' : 'rejected'
        } successfully`
      );

      // Refresh contents data
      refreshContents();
      setConfirmModalOpen(false);
    } catch (error: any) {
      console.error('Error updating content status:', error);
      toast.error(
        `Failed to ${status} content. ${error.response.data.message} .Please try again.`
      );
    } finally {
      setIsSubmitting(false);
      setConfirmModalOpen(false);
    }
  };

  const openConfirmModal = (content: any, action: 'accept' | 'reject') => {
    setContentToAction(content);
    setActionType(action);
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
    setContentToAction(null);
    setActionType(null);
    setRejectReason(null);
  };

  const handleViewContent = (content: any) => {
    setSelectedContent(content);
    setIsContentModalOpen(true);
  };

  const handleCloseContentModal = () => {
    setIsContentModalOpen(false);
    setSelectedContent(null);
  };

  const renderTabs = () => {
    const tabs = ['REJECTED', 'PENDING', 'ACCEPTED', 'UNPAID'];
    return (
      <div>
        <div className='flex'>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-t-lg capitalize ${
                activeTab === tab
                  ? 'influencer-primary-gradient text-white'
                  : 'bg-transparent text-gray-800 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'ACCEPTED' ? 'PAID' : tab}
            </button>
          ))}
        </div>
        <Seperator className='!w-full' />
      </div>
    );
  };

  const renderFilters = () => {
    const filterOptions = [
      { value: 'All Platforms', label: 'All Platforms' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'tiktok', label: 'TikTok' },
      { value: 'youtube', label: 'YouTube' },
    ];

    return (
      <div className='flex flex-col md:flex-row md:justify-between gap-2 md:items-center mb-1 md:mb-4'>
        <div className='w-64'>
          <Input
            placeholder='Search contents...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<LuSearch className='text-gray-400' />}
          />
        </div>
        <div className='flex items-center gap-2 justify-between md:justify-start'>
          <div className='w-40'>
            <Select
              placeholder='Platform'
              options={filterOptions}
              value={filterValue}
              setValue={setFilterValue}
            />
          </div>
        </div>
      </div>
    );
  };

  const getStatusBadge = (
    status: string,
    rejectedReason?: string | undefined
  ) => {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return (
          <div className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium'>
            Accepted
          </div>
        );
      case 'REJECTED':
        return (
          <div
            className='bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium cursor-pointer'
            onClick={() => setReasonModal(rejectedReason as string)}
          >
            Rejected
          </div>
        );
      case 'PENDING':
      default:
        return (
          <div className='bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium text-center'>
            Pending
          </div>
        );
    }
  };

  const renderPlatformBadges = (platforms: string[]) => {
    return (
      <div className='flex flex-wrap gap-1'>
        {platforms.map((platform, index) => (
          <span
            key={index}
            className='bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs'
          >
            {platform}
          </span>
        ))}
      </div>
    );
  };

  // Define table columns
  const columns = [
    columnHelper.accessor((row) => row.application?.influencer, {
      id: 'influencer',
      header: 'INFLUENCER',
      cell: (info) => {
        const influencer = info.getValue();
        return influencer ? (
          <Link href={`/users/${influencer._id}`} className='flex items-center'>
            <div className='w-10 h-10 relative rounded-full overflow-hidden mr-4'>
              <Image
                src={
                  influencer.profilePicture
                    ? `${BACKEND_URL}/uploads/${influencer.profilePicture}`
                    : '/assets/default-avatar.png'
                }
                alt={influencer.name}
                width={40}
                height={40}
                className='object-cover'
              />
            </div>
            <div>
              <p className='font-medium text-sm dark:text-white'>
                {influencer.name}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {influencer.email}
              </p>
            </div>
          </Link>
        ) : (
          <span className='text-gray-500'>Unknown</span>
        );
      },
    }),
    columnHelper.accessor('title', {
      header: 'TITLE',
      cell: (info) => (
        <span className='text-sm font-medium'>{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('socialMediaPlatforms', {
      header: 'PLATFORMS',
      cell: (info) => renderPlatformBadges(info.getValue() || []),
    }),
    columnHelper.accessor('createdAt', {
      header: 'DATE',
      cell: (info) => (
        <span className='text-sm'>
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.status, {
      id: 'status',
      header: 'STATUS',
      cell: (info) => getStatusBadge(info.getValue(), info.row.original.reason),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'ACTIONS',
      cell: (info) => {
        const content = info.row.original;
        const canAction = content.status.toUpperCase() === 'PENDING';

        // Only show action buttons for business users
        if (userType !== 'business') {
          return null;
        }

        return (
          <div className='flex items-center gap-2'>
            {canAction ? (
              <>
                <button
                  className='text-green-500 hover:text-green-700 disabled:opacity-50'
                  onClick={() => openConfirmModal(content, 'accept')}
                  disabled={!canAction || isSubmitting}
                >
                  <AiOutlineCheck size={20} />
                </button>
                <button
                  className='text-red-500 hover:text-red-700 disabled:opacity-50'
                  onClick={() => openConfirmModal(content, 'reject')}
                  disabled={!canAction || isSubmitting}
                >
                  <IoCloseOutline size={20} />
                </button>
              </>
            ) : content.status === 'accepted' && !content.isPaid ? (
              <button
                className='text-red-500 hover:text-red-700 disabled:opacity-50'
                onClick={() => handlePayContent(content._id)}
                // disabled={isSubmitting}
              >
                Pay To Launch
              </button>
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'view',
      header: '',
      cell: (info) => (
        <button
          className='text-blue-500 hover:text-blue-700'
          onClick={() => handleViewContent(info.row.original)}
        >
          View Content
        </button>
      ),
    }),
  ];

  const renderContents = () => {
    return (
      <div className='rounded-md overflow-hidden w-full'>
        {filteredContents.length === 0 ? (
          <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
            No {activeTab.toLowerCase()} content found.
          </div>
        ) : (
          <Table columns={columns} data={filteredContents} />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-red-50 text-red-700 rounded-md'>
        Error loading campaign contents. Please try again.
      </div>
    );
  }

  return (
    <div className='md:p-4 bg-gray-100 dark:bg-gray-900 min-h-screen'>
      <h1 className='text-xl font-bold text-brand-primary mb-6'>
        CAMPAIGN CONTENTS
      </h1>
      {renderTabs()}
      <div className='mt-2 md:p-4 rounded-md space-y-4'>
        {renderFilters()}
        {renderContents()}
      </div>

      {/* Content Detail Modal */}
      <Modal
        isOpen={isContentModalOpen}
        onClose={handleCloseContentModal}
        title='Content Details'
      >
        <div className='p-4'>
          {selectedContent && (
            <div>
              <div className='mb-4'>
                <h3 className='text-md font-semibold mb-2'>Influencer</h3>
                <p>
                  {selectedContent.application?.influencer?.name || 'Unknown'}
                </p>
              </div>

              <div className='mb-4'>
                <h3 className='text-md font-semibold mb-2'>Title</h3>
                <p>{selectedContent.title}</p>
              </div>

              <div className='mb-4'>
                <h3 className='text-md font-semibold mb-2'>Description</h3>
                <p className='whitespace-pre-wrap'>
                  {selectedContent.description}
                </p>
              </div>

              <div className='mb-4'>
                <h3 className='text-md font-semibold mb-2'>Platforms</h3>
                <div className='flex gap-2'>
                  {selectedContent.socialMediaPlatforms?.map(
                    (platform: string, index: number) => (
                      <span
                        key={index}
                        className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm'
                      >
                        {platform}
                      </span>
                    )
                  )}
                </div>
              </div>

              {selectedContent.contentAssets &&
                selectedContent.contentAssets.length > 0 && (
                  <div className='mb-4'>
                    <h3 className='text-md font-semibold mb-2'>
                      Content Assets
                    </h3>
                    <div className='grid grid-cols-2 gap-4'>
                      {selectedContent.contentAssets.map(
                        (asset: string, index: number) => (
                          <div
                            key={index}
                            className='relative h-48 rounded-md overflow-hidden'
                          >
                            {asset.endsWith('.mp4') ? (
                              <video
                                src={asset}
                                controls
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <Image
                                src={asset}
                                alt={`Content asset ${index + 1}`}
                                fill
                                className='object-cover'
                              />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {selectedContent.postUrls &&
                selectedContent.postUrls.length > 0 && (
                  <div className='mb-4'>
                    <h3 className='text-md font-semibold mb-2'>Post URLs</h3>
                    <ul className='list-disc ml-5'>
                      {selectedContent.postUrls.map(
                        (url: string, index: number) => (
                          <li key={index}>
                            <a
                              href={url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-500 hover:underline'
                            >
                              {url}
                            </a>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {selectedContent.status.toUpperCase() === 'PENDING' &&
                userType === 'business' && (
                  <div className='mt-6 flex justify-end gap-3'>
                    <button
                      onClick={() => {
                        handleCloseContentModal();
                        openConfirmModal(selectedContent, 'accept');
                      }}
                      className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50'
                      disabled={isSubmitting}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleCloseContentModal();
                        openConfirmModal(selectedContent, 'reject');
                      }}
                      className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50'
                      disabled={isSubmitting}
                    >
                      Reject
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
      </Modal>

      {/* Reason Modal */}
      <Modal
        isOpen={!!reasonModal}
        onClose={() => setReasonModal(false)}
        title='Reason for Rejection'
      >
        <div>
          <p className='mb-4'>
            The content has been rejected. Please see the reason for the
            rejection.
          </p>
          <TextArea
            value={reasonModal?.toString() || ''}
            onChange={(e) => {}}
            placeholder='No reason provided'
            disabled
          />
          <div className='flex justify-end mt-4'>
            <button
              onClick={() => setReasonModal(false)}
              className='px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={closeConfirmModal}
        title={`${actionType === 'accept' ? 'Approve' : 'Reject'} Content`}
      >
        <div className='p-4'>
          <p className='mb-4'>
            Are you sure you want to{' '}
            {actionType === 'accept' ? 'approve' : 'reject'} this content from{' '}
            <span className='font-semibold'>
              {contentToAction?.application?.influencer?.name ||
                'the influencer'}
            </span>
            ?
          </p>
          <p className='mb-6 text-sm text-gray-600'>
            {actionType === 'accept'
              ? 'Approving this content will mark it as ready for publication.'
              : 'Rejecting this content will require the influencer to submit revisions.'}
          </p>
          {actionType === 'reject' && (
            <>
              <p className='mb-2'>Reason for rejection (Optional)</p>
              <TextArea
                onChange={(e) => setRejectReason(e.target.value)}
                value={rejectReason || ''}
              />
            </>
          )}
          <div className='flex justify-end gap-3'>
            <button
              onClick={closeConfirmModal}
              className='px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'
            >
              Cancel
            </button>
            <button
              onClick={() =>
                handleUpdateContentStatus(
                  contentToAction?._id,
                  actionType === 'accept' ? 'accepted' : 'rejected',
                  actionType === 'reject' ? rejectReason : undefined
                )
              }
              className={`px-4 py-2 rounded text-white ${
                actionType === 'accept'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              } disabled:opacity-50`}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processing...'
                : actionType === 'accept'
                ? 'Approve'
                : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CampaignContentsPage;
