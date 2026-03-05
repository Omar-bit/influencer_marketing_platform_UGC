'use client';

import { useState } from 'react';
import useGetBrandsAllApplications from '@/hooks/useGetBrandsAllApplications';
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
import { updateApplicationStatus } from '@/utils/api/handlers/application';
import { toast } from 'react-toastify';

export default function ApplicationsPage() {
  const {
    data: applications = [],
    isLoading: isLoadingApps,
    refetch: refetchApplications,
  } = useGetBrandsAllApplications();
  console.log('applications', applications);

  const [activeTab, setActiveTab] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState({
    value: 'All Platforms',
    label: 'All Platforms',
  });

  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'decline' | null>(
    null
  );
  const [applicationToAction, setApplicationToAction] = useState<any>(null);

  // Filter applications based on active tab, search term, and platform filter
  const filteredApplications = applications.filter((app: any) => {
    // Filter by status tab
    if (app.status.toUpperCase() !== activeTab) return false;

    // Filter by search term
    if (
      searchTerm &&
      !app.campaign?.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      !app.influencer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !app.proposal?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    if (filterValue.value !== 'All Platforms') {
      const influencerPlatforms = app.influencer.socialMedia
        ? app.influencer.socialMedia.map((sm: any) => sm.platform.toLowerCase())
        : [];
      if (!influencerPlatforms.includes(filterValue.value.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const handleUpdateStatus = async (
    applicationId: string,
    status: 'accepted' | 'rejected'
  ) => {
    try {
      setIsSubmitting(true);
      await updateApplicationStatus(applicationId, { status });
      toast.success(
        `Application ${
          status === 'accepted' ? 'accepted' : 'declined'
        } successfully`
      );
      refetchApplications();
      setConfirmModalOpen(false);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error(`Failed to ${status} application. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirmModal = (application: any, action: 'accept' | 'decline') => {
    setApplicationToAction(application);
    setActionType(action);
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
    setApplicationToAction(null);
    setActionType(null);
  };

  const handleViewProposal = (application: any) => {
    setCurrentApplication(application);
    setSelectedProposal(application.proposal);
    setIsProposalModalOpen(true);
  };

  const handleCloseProposalModal = () => {
    setIsProposalModalOpen(false);
    setSelectedProposal(null);
    setCurrentApplication(null);
  };

  const renderTabs = () => {
    const tabs = ['PENDING', 'ACCEPTED', 'REJECTED'];
    return (
      <div>
        <div className='flex'>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-t-lg ${
                activeTab === tab
                  ? 'influencer-primary-gradient text-white'
                  : 'bg-transparent text-gray-800 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
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
            placeholder='Search campaign...'
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

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return (
          <div className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium'>
            Accepted
          </div>
        );
      case 'REJECTED':
        return (
          <div className='bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium'>
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

  const columns = [
    columnHelper.accessor((row) => row.influencer, {
      id: 'influencer',
      header: 'INFLUENCER',
      cell: (info) => {
        const influencer = info.getValue();
        return (
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
        );
      },
    }),
    columnHelper.accessor(
      (row) => row.campaign?.description || 'No description',
      {
        id: 'campaign',
        header: 'CAMPAIGN',
        cell: (info) => <span className='text-sm'>{info.getValue()}</span>,
      }
    ),
    columnHelper.accessor(
      (row) => {
        const platforms = row.influencer.socialMedia
          ? row.influencer.socialMedia.map((sm: any) => sm.platform).join(', ')
          : 'None';
        return platforms;
      },
      {
        id: 'platforms',
        header: 'PLATFORMS',
        cell: (info) => <span className='text-sm'>{info.getValue()}</span>,
      }
    ),

    columnHelper.accessor('createdAt', {
      header: 'DATE',
      cell: (info) => (
        <span className='text-sm'>
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'STATUS',
      cell: (info) => getStatusBadge(info.getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'ACTIONS',
      cell: (info) => {
        const application = info.row.original;
        const isPending = application.status.toUpperCase() === 'PENDING';

        return (
          <div className='flex items-center gap-2'>
            <button
              className='text-green-500 hover:text-green-700 disabled:opacity-50'
              onClick={() => openConfirmModal(application, 'accept')}
              disabled={isSubmitting}
            >
              <AiOutlineCheck size={20} />
            </button>
            <button
              className='text-red-500 hover:text-red-700 disabled:opacity-50'
              onClick={() => openConfirmModal(application, 'decline')}
              disabled={isSubmitting}
            >
              <IoCloseOutline size={20} />
            </button>
            {/* {isPending ? (
              <>
                <button
                  className='text-green-500 hover:text-green-700 disabled:opacity-50'
                  onClick={() => openConfirmModal(application, 'accept')}
                  disabled={isSubmitting}
                >
                  <AiOutlineCheck size={20} />
                </button>
                <button
                  className='text-red-500 hover:text-red-700 disabled:opacity-50'
                  onClick={() => openConfirmModal(application, 'decline')}
                  disabled={isSubmitting}
                >
                  <IoCloseOutline size={20} />
                </button>
              </>
            ) : (
              <span className='text-xs text-gray-500'>
                {application.status === 'ACCEPTED' ? 'Accepted' : 'Declined'}
              </span>
            )} */}
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
          onClick={() => handleViewProposal(info.row.original)}
        >
          View Proposal
        </button>
      ),
    }),
  ];

  const renderApplications = () => {
    return (
      <div className='rounded-md overflow-hidden w-full'>
        {filteredApplications.length === 0 ? (
          <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
            No {activeTab.toLowerCase()} applications found.
          </div>
        ) : (
          <Table columns={columns} data={filteredApplications} />
        )}
      </div>
    );
  };

  if (isLoadingApps) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500'></div>
      </div>
    );
  }

  return (
    <div className='md:p-4  bg-gray-100 dark:bg-gray-900 min-h-screen'>
      <h1 className='text-xl font-bold text-brand-primary mb-6'>
        CAMPAIGN APPLICATIONS
      </h1>
      {renderTabs()}
      <div className='mt-2 md:p-4  rounded-md space-y-4'>
        {renderFilters()}
        {renderApplications()}
      </div>

      {/* Proposal Modal */}
      <Modal
        isOpen={isProposalModalOpen}
        onClose={handleCloseProposalModal}
        title='Proposal Details'
      >
        <div className='p-4'>
          {currentApplication && (
            <div>
              <div className='mb-4'>
                <h3 className='text-md font-semibold mb-2'>Influencer</h3>
                <p>{currentApplication.influencer?.name || 'Unknown'}</p>
              </div>

              <div>
                <h3 className='text-md font-semibold mb-2'>Proposal</h3>
                <p className='whitespace-pre-wrap'>{selectedProposal}</p>
              </div>

              {currentApplication.status.toUpperCase() === 'PENDING' && (
                <div className='mt-6 flex justify-end gap-3'>
                  <button
                    onClick={() => {
                      handleCloseProposalModal();
                      openConfirmModal(currentApplication, 'accept');
                    }}
                    className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50'
                    disabled={isSubmitting}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      handleCloseProposalModal();
                      openConfirmModal(currentApplication, 'decline');
                    }}
                    className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50'
                    disabled={isSubmitting}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={closeConfirmModal}
        title={`${actionType === 'accept' ? 'Accept' : 'Decline'} Application`}
      >
        <div className='p-4'>
          <p className='mb-4'>
            Are you sure you want to{' '}
            {actionType === 'accept' ? 'accept' : 'decline'} this application
            from{' '}
            <span className='font-semibold'>
              {applicationToAction?.influencer?.name}
            </span>
            ?
          </p>
          <p className='mb-6 text-sm text-gray-600'>
            {actionType === 'accept'
              ? 'Accepting this application will allow the influencer to proceed with the campaign.'
              : 'Declining this application will notify the influencer that they were not selected for this campaign.'}
          </p>
          <div className='flex justify-end gap-3'>
            <button
              onClick={closeConfirmModal}
              className='px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'
            >
              Cancel
            </button>
            <button
              onClick={() =>
                handleUpdateStatus(
                  applicationToAction?._id,
                  actionType === 'accept' ? 'accepted' : 'rejected'
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
                ? 'Accept'
                : 'Decline'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
