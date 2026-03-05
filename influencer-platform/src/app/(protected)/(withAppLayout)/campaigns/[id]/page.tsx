'use client';

import useGetCampaign from '@/hooks/useGetCampaign';
import useGetApplicationStatus from '@/hooks/useGetApplicationStatus';
import { useParams } from 'next/navigation';
import ContentCard, {
  ContentSection,
  BulletList,
  InfoItem,
} from '@/components/shared/ContentCard';
import Image from 'next/image';
import {
  FiMail,
  FiGlobe,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiFile,
  FiDownload,
  FiBarChart,
  FiExternalLink,
  FiImage,
  FiX,
} from 'react-icons/fi';

import { FaCube, FaFacebookF } from 'react-icons/fa';
import { DEFAULT_CAMPAIGN_IMAGE } from '@/utils/constants';
import Button from '@/components/ui/button';
import { MdAttachment, MdOutlineDone } from 'react-icons/md';
import { useState } from 'react';
import ApplicationModal from '@/components/modals/ApplicationModal';
import { applyToCampaign } from '@/utils/api/handlers/application';

import { toast } from 'react-toastify';
import { BACKEND_URL } from '@/utils/secrets';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ContentSuggestionsCard from '@/components/shared/ContentSuggestionsCard';
import ContentSubmissionModal from '@/components/modals/ContentSubmissionModal';
import ThreeDViewerModal from '@/components/modals/ThreeDViewerModal';
import { AiFillTikTok } from 'react-icons/ai';
import {
  generateThreeDProduct,
  // payCampaign,
  closeCampaign,
} from '@/utils/api/handlers/campaign';
import {
  SkeletonCard,
  SkeletonImage,
  SkeletonText,
} from '@/components/shared/Skeleton';
import Modal from '@/components/modals/Modal';

// Skeleton components

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  console.log(session);
  //@ts-ignore
  const isInfluencer = session?.user?.type === 'influencer' ? true : false;
  const { data: campaignData, isLoading, error } = useGetCampaign(id as string);
  const {
    data: applicationData,
    isLoading: isLoadingApplication,
    refetch: refetchAppStatus,
  } = useGetApplicationStatus(id as string);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isContentSubmissionModalOpen, setIsContentSubmissionModalOpen] =
    useState(false);
  const [isThreeDModalOpen, setIsThreeDModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    fileName: string;
    threeDPath?: string;
  }>({ fileName: '' });
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [isClosingCampaign, setIsClosingCampaign] = useState(false);
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);

  // Add close campaign handler
  const handleCloseCampaign = async () => {
    if (!id) return;

    setIsClosingCampaign(true);
    try {
      await closeCampaign(id as string);
      toast.success('Campaign closed successfully!');
      setShowCloseConfirmModal(false);
      // Refresh campaign data to reflect the status change
      window.location.reload();
    } catch (error: any) {
      console.error('Error closing campaign:', error);
      toast.error(
        error?.response?.data?.message ||
          'Failed to close campaign. Please try again.'
      );
    } finally {
      setIsClosingCampaign(false);
    }
  };

  const campaignImage = campaignData?.image
    ? BACKEND_URL + '/uploads/' + campaignData.image
    : null;
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleApply = async (proposal: string) => {
    if (!id) return;

    setIsApplying(true);
    try {
      await applyToCampaign(id as string, { proposal });
      toast.success('Application submitted successfully!');
      handleCloseModal();
      refetchAppStatus();
    } catch (error) {
      console.error('Error applying to campaign:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  // Prepare campaign data once loaded
  const campaignGoals = [];
  const contentRequirements = [];
  const timeline = [];

  if (!isLoading && campaignData) {
    if (campaignData.reachTarget) {
      campaignGoals.push(`Reach ${campaignData.reachTarget} impressions`);
    }
    if (campaignData.engagementRate) {
      campaignGoals.push(
        `Achieve ${campaignData.engagementRate}% engagement rate`
      );
    }
    if (campaignData.conversionTarget) {
      campaignGoals.push(
        `Generate ${campaignData.conversionTarget} conversions`
      );
    }
    if (campaignData.customGoal) {
      campaignGoals.push(campaignData.customGoal);
    }

    if (campaignData.contentRequirements) {
      contentRequirements.push(
        ...campaignData.contentRequirements
          .split('\n')
          .filter((item: any) => item.trim() !== '')
      );
    }

    if (campaignData.startDate) {
      timeline.push(
        `Start date: ${new Date(campaignData.startDate).toLocaleDateString()}`
      );
    }
    if (campaignData.endDate) {
      timeline.push(
        `End date: ${new Date(campaignData.endDate).toLocaleDateString()}`
      );
    }
  }

  const handleView3DModel = (fileName: string, threeDPath?: string) => {
    setSelectedFile({ fileName, threeDPath });
    setIsThreeDModalOpen(true);
  };

  // const payCampaignHandler = async () => {
  //   try {
  //     const response = await payCampaign(id as string, {});
  //     console.log('payment ', response);
  //     if (response.success) {
  //       toast.success('Payment successful!');
  //       const { data } = response;
  //       const { payUrl } = data;
  //       if (payUrl) {
  //         window.location.href = payUrl;
  //       } else {
  //         toast.error('Payment URL not found. Please try again.');
  //       }
  //     } else {
  //       toast.error('Payment failed. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('Error processing payment:', error);
  //     toast.error('An error occurred while processing payment.');
  //   }
  // };

  const handleGenerate3DModel = async (fileName: string) => {
    try {
      setIsGenerating3D(true);
      setSelectedFile({ fileName });

      const response = await generateThreeDProduct(id as string, fileName);

      if (response.success) {
        // Update the campaign data to reflect the new 3D model
        const updatedCampaignData = { ...campaignData };
        const fileToUpdate = updatedCampaignData.product.images.find(
          (file: any) => file.file === fileName
        );

        if (fileToUpdate) {
          fileToUpdate.three = response.data;
          // Show the 3D viewer with the new model
          handleView3DModel(fileName, response.data);
        }
      }
    } catch (error) {
      console.error('Error generating 3D model:', error);
      alert('Failed to generate 3D model. Please try again later.');
    } finally {
      setIsGenerating3D(false);
    }
  };

  const renderApplicationStatus = () => {
    if (!applicationData || !applicationData.status) return null;

    const status = applicationData.status;
    let statusClass = '';
    let statusText = '';

    switch (status) {
      case 'pending':
        statusClass =
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        statusText = 'Application Pending';
        break;
      case 'accepted':
        statusClass =
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        statusText = 'Application Accepted';
        break;
      case 'rejected':
        statusClass =
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        statusText = 'Application Rejected';
        break;
      default:
        statusClass =
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        statusText = 'Unknown Status';
    }

    return (
      <div
        className={`flex-1 mx-auto px-4 py-3 rounded-md ${statusClass} text-center font-medium`}
      >
        {statusText}
      </div>
    );
  };

  if (error) {
    return (
      <div className='p-2 w-full max dark:bg-gray-900'>
        <main className='w-full flex flex-col gap-6'>
          <SkeletonCard>
            <div className='text-red-500 text-center font-semibold'>
              Error loading campaign data. Please try again later.
            </div>
          </SkeletonCard>
        </main>
      </div>
    );
  }
  return (
    <div className='p-2 w-full max dark:bg-gray-900 relative'>
      <main className='w-full flex flex-col gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
          <div className='flex flex-col md:flex-row'>
            {' '}
            <div className='md:w-1/2 bg-pink-100 dark:bg-pink-900 relative min-h-[250px] md:min-h-[300px]'>
              {isLoading ? (
                <SkeletonImage />
              ) : (
                <div className='relative w-full h-full min-h-[250px] md:min-h-[300px] overflow-hidden'>
                  <Image
                    src={campaignImage || DEFAULT_CAMPAIGN_IMAGE}
                    onError={(e) => {
                      //@ts-ignore
                      (e.target as HTMLImageElement).src =
                        DEFAULT_CAMPAIGN_IMAGE;
                    }}
                    alt={`${campaignData?.name || 'Campaign'} image`}
                    fill
                    sizes='(max-width: 768px) 100vw, 50vw'
                    className='object-cover object-center'
                    priority
                  />
                  <div className='flex items-stretch justify-between  absolute top-0 left-0 w-full gap-3'>
                    {!isInfluencer && (
                      <>
                        <Link
                          href={`/campaigns/${id}/contents`}
                          className='flex items-center gap-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg rounded-tl-none transition-colors duration-200 shadow-sm hover:shadow-md group opacity-65 hover:opacity-100'
                        >
                          <FiImage className='w-5 h-5 group-hover:scale-110 transition-transform' />
                          <div className='flex flex-col gap-[1px]'>
                            <span className='font-medium text-xs'>
                              Campaign Contents
                            </span>
                            <span className='text-[9px] text-purple-100'>
                              View and manage submitted content
                            </span>
                          </div>
                          <FiExternalLink className='w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform' />
                        </Link>
                        <Link
                          href={`/campaigns/${id}/performance`}
                          className='flex items-center gap-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg rounded-tr-none transition-colors duration-200 shadow-sm hover:shadow-md group opacity-65 hover:opacity-100'
                        >
                          <FiBarChart className='w-5 h-5 group-hover:scale-110 transition-transform' />
                          <div className='flex flex-col gap-[1px]'>
                            <span className='font-medium text-xs'>
                              Campaign Performance
                            </span>
                            <span className='text-[9px] text-emerald-100'>
                              Analytics, metrics & insights
                            </span>
                          </div>
                          <FiExternalLink className='w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform' />
                        </Link>
                      </>
                    )}
                    {!isInfluencer &&
                      campaignData?.status === 'unpaid' &&
                      // <Button onClick={payCampaignHandler}>Pay to Launch</Button>
                      null}
                  </div>
                </div>
              )}
            </div>
            <div className='md:w-3/4 p-6 pt-1 '>
              <div className='mb-6'>
                {isLoading ? (
                  <>
                    <SkeletonText height='h-8' />
                    <div className='mt-2 flex gap-4'>
                      <SkeletonText width='w-1/4' />
                      <SkeletonText width='w-1/4' />
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className='text-2xl font-bold text-purple-700 dark:text-purple-400'>
                      {campaignData?.name || 'Campaign Name'}
                    </h1>
                    <div className='flex gap-2 text-sm'>
                      <span className='text-gray-600 dark:text-gray-300'>
                        {campaignData?.ecommerceCategory || 'General'}
                      </span>
                      <span className='text-gray-400 dark:text-gray-500'>
                        •
                      </span>
                      <span className='text-gray-600 dark:text-gray-300'>
                        {campaignData?.country || 'Global'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className='mb-6 space-y-2'>
                <h4 className='text-[14px] font-semibold pl-1 dark:text-gray-200'>
                  Brand Information
                </h4>
                <ContentCard title='' headerVariant='default' user='influencer'>
                  {isLoading ? (
                    <>
                      <div className='flex items-center gap-2 mb-3'>
                        <div className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse'></div>
                        <SkeletonText width='w-1/3' />
                      </div>
                      <div className='space-y-3'>
                        <SkeletonText />
                        <SkeletonText />
                        <div className='flex gap-3 mt-2'>
                          <div className='w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse'></div>
                          <div className='w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse'></div>
                          <div className='w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse'></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/users/${campaignData.business._id}`}
                        className='flex items-center gap-2 mb-3'
                      >
                        <div className='w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300'>
                          {campaignData?.business?.name?.charAt(0) || 'B'}
                        </div>
                        <div>
                          <h3 className='font-medium dark:text-gray-200'>
                            {campaignData?.business?.name || 'Business Name'}
                          </h3>
                        </div>
                      </Link>

                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center'>
                          <FiMail
                            className='text-gray-400 dark:text-gray-500 mr-2'
                            size={14}
                          />
                          <span className='text-gray-600 dark:text-gray-300'>
                            {campaignData?.business?.email ||
                              'contact@business.com'}
                          </span>
                        </div>
                        <div className='flex items-center'>
                          <FiGlobe
                            className='text-gray-400 dark:text-gray-500 mr-2'
                            size={14}
                          />
                          <span className='text-gray-600 dark:text-gray-300'>
                            {campaignData?.business?.website ||
                              'www.businesswebsite.com'}
                          </span>
                        </div>
                        <div className='flex items-center gap-3 mt-2'>
                          <span className='text-pink-500 hover:text-pink-600 cursor-pointer'>
                            <FiInstagram size={14} />
                          </span>
                          <span className='text-pink-500 hover:text-pink-600 cursor-pointer'>
                            <FiTwitter size={14} />
                          </span>
                          <span className='text-pink-500 hover:text-pink-600 cursor-pointer'>
                            <FiYoutube size={14} />
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </ContentCard>
              </div>

              <div className='mb-6 space-y-2'>
                <h4 className='text-[14px] font-semibold pl-1 dark:text-gray-200'>
                  Campaign Description
                </h4>
                <ContentCard
                  title=''
                  headerVariant='separated'
                  user='influencer'
                >
                  {isLoading ? (
                    <div className='space-y-2'>
                      <SkeletonText />
                      <SkeletonText />
                      <SkeletonText width='w-2/3' />
                    </div>
                  ) : (
                    <p className='text-sm text-gray-700 dark:text-gray-300'>
                      {campaignData?.description || 'No description provided.'}
                    </p>
                  )}
                </ContentCard>
              </div>

              <div className='mb-6'>
                <h2 className='text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2'>
                  Platforms
                </h2>
                {isLoading ? (
                  <div className='flex gap-2'>
                    <div className='influencer-primary-gradient opacity-40 w-1/3 h-10 rounded animate-pulse'></div>
                    <div className='influencer-primary-gradient opacity-40 w-1/3 h-10 rounded animate-pulse'></div>
                  </div>
                ) : (
                  <div className='flex gap-2 flex-wrap'>
                    {campaignData?.platforms &&
                    campaignData.platforms.length > 0 ? (
                      campaignData.platforms.map((platform: string) => {
                        let icon;
                        if (platform.toLowerCase().includes('facebook')) {
                          icon = <FaFacebookF className='mr-2' />;
                        } else if (platform.toLowerCase().includes('youtube')) {
                          icon = <FiYoutube className='mr-2' />;
                        } else if (
                          platform.toLowerCase().includes('instagram')
                        ) {
                          icon = <FiInstagram className='mr-2' />;
                        } else if (platform.toLowerCase().includes('tiktok')) {
                          icon = <AiFillTikTok className='mr-2' />;
                        } else {
                          icon = <FiGlobe className='mr-2' />;
                        }

                        return (
                          <div
                            key={platform}
                            className={`influencer-primary-gradient text-white px-4 py-3 rounded flex items-center justify-center flex-1`}
                          >
                            {icon}
                            <span>{platform}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className='text-gray-500 dark:text-gray-400 text-sm'>
                        No platforms specified
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className='mb-6'>
                <h2 className='text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2'>
                  Price
                </h2>
                <div className='flex items-center gap-2'>
                  {isLoading ? (
                    <div className='influencer-primary-gradient opacity-40 w-1/3 h-10 rounded animate-pulse'></div>
                  ) : (
                    <span className='text-lg font-semibold text-green-700 dark:text-green-400'>
                      {campaignData?.budget
                        ? `${campaignData.budget}TND`
                        : 'To be discussed'}
                    </span>
                  )}
                </div>
              </div>
              {!isInfluencer && (
                <div className='flex items-center justify-end gap-4'>
                  {isLoading ? (
                    <div className='flex gap-2'>
                      <div className='influencer-primary-gradient opacity-40 w-1/3 h-10 rounded animate-pulse'></div>
                      <div className='influencer-primary-gradient opacity-40 w-1/3 h-10 rounded animate-pulse'></div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCloseConfirmModal(true)}
                      className='flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg  transition-colors duration-200 shadow-sm hover:shadow-md group '
                      disabled={
                        isClosingCampaign || campaignData?.status === 'closed'
                      }
                    >
                      <FiX className='w-5 h-5 group-hover:scale-110 transition-transform' />
                      <div className='flex flex-col gap-[1px]'>
                        {campaignData.status !== 'closed' ? (
                          <span className='font-medium text-xs'>
                            {isClosingCampaign
                              ? 'Closing...'
                              : 'Close Campaign'}
                          </span>
                        ) : (
                          <span className='font-medium text-xs'>
                            Campaign Closed
                          </span>
                        )}
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {!isInfluencer ? null : isLoadingApplication ? (
          <div className='w-[95%] mx-auto h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md'></div>
        ) : applicationData?.status ? (
          <div className='w-[95%] mx-auto flex items-stretch justify-between gap-1 mb-2'>
            {renderApplicationStatus()}
            {applicationData?.status === 'accepted' && (
              <Button
                className='flex-1'
                onClick={() => setIsContentSubmissionModalOpen(true)}
              >
                <div className='flex items-center justify-center gap-2'>
                  <MdAttachment className=' -rotate-90' />
                  <span>Submit Content</span>
                </div>
              </Button>
            )}
          </div>
        ) : (
          <div className=''>
            <Button
              className='w-[95%] mx-auto'
              onClick={handleOpenModal}
              disabled={isApplying || isLoading}
            >
              <div className='flex items-center justify-center gap-2'>
                <div className='size-4 text-white bg-white rounded-full flex items-center justify-center'>
                  <MdOutlineDone className='text-influencer-primary' />
                </div>
                <span>
                  {isApplying
                    ? 'Applying...'
                    : isLoading
                    ? 'Loading...'
                    : 'Apply'}
                </span>
              </div>
            </Button>
          </div>
        )}

        {/* Content Suggestions Section for Accepted Applications */}
        {isInfluencer &&
          applicationData?.status === 'accepted' &&
          applicationData?.id && (
            <ContentSuggestionsCard
              applicationId={applicationData.id}
              campaignName={campaignData?.name || 'this campaign'}
            />
          )}

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <ContentCard title='Campaign Stats' headerVariant='separated'>
            {isLoading ? (
              <div className='space-y-3'>
                <SkeletonText />
                <SkeletonText />
                <SkeletonText />
              </div>
            ) : (
              <>
                <InfoItem
                  label='Compensation'
                  value={
                    campaignData?.budget
                      ? `$${campaignData.budget}`
                      : 'To be discussed'
                  }
                />
                <InfoItem
                  label='Influencers Needed'
                  value={campaignData?.nbrOfInfluencers || 'Not specified'}
                />
                <InfoItem
                  label='Posted'
                  value={
                    campaignData?.createdAt
                      ? new Date(campaignData.createdAt).toLocaleDateString()
                      : 'Unknown'
                  }
                />
              </>
            )}
          </ContentCard>

          <ContentCard
            title='Influencer Requirements'
            headerVariant='separated'
          >
            {isLoading ? (
              <div className='space-y-3'>
                <SkeletonText />
                <SkeletonText />
                <SkeletonText />
              </div>
            ) : (
              <>
                <InfoItem
                  label='Followers'
                  value={
                    campaignData?.reachTarget
                      ? `${campaignData.reachTarget}+`
                      : 'No minimum'
                  }
                />
                <InfoItem
                  label='Audience Demographics'
                  value={campaignData?.tags || 'Not specified'}
                />
                <InfoItem
                  label='Product Category'
                  value={
                    campaignData?.product?.category ||
                    campaignData?.ecommerceCategory ||
                    'Not specified'
                  }
                />
              </>
            )}
          </ContentCard>

          <ContentCard title='Campaign Goals' headerVariant='separated'>
            {isLoading ? (
              <div className='space-y-2'>
                <SkeletonText />
                <SkeletonText />
                <SkeletonText />
              </div>
            ) : (
              <>
                {campaignGoals.length > 0 ? (
                  <BulletList items={campaignGoals} />
                ) : (
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    No specific goals provided
                  </p>
                )}
              </>
            )}
          </ContentCard>
        </div>

        <ContentCard title='Requirements' headerVariant='separated'>
          {isLoading ? (
            <div className='space-y-4'>
              <div>
                <SkeletonText width='w-1/3' height='h-5' className='mb-2' />
                <div className='space-y-2 pl-4'>
                  <SkeletonText />
                  <SkeletonText />
                  <SkeletonText width='w-2/3' />
                </div>
              </div>
              <div>
                <SkeletonText width='w-1/3' height='h-5' className='mb-2' />
                <div className='space-y-2 pl-4'>
                  <SkeletonText />
                  <SkeletonText width='w-1/2' />
                </div>
              </div>
            </div>
          ) : (
            <>
              <ContentSection title='Content Requirements'>
                {contentRequirements.length > 0 ? (
                  <BulletList items={contentRequirements} />
                ) : (
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    No specific content requirements provided
                  </p>
                )}
              </ContentSection>

              <ContentSection title='Timeline'>
                {timeline.length > 0 ? (
                  <BulletList items={timeline} />
                ) : (
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    No timeline specified
                  </p>
                )}
              </ContentSection>
            </>
          )}
        </ContentCard>

        {/* Product Files Section */}
        {!isLoading &&
          campaignData?.product?.images &&
          campaignData.product.images.length > 0 && (
            <ContentCard title='Product Files' headerVariant='separated'>
              <ContentSection title='Available Files'>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3'>
                  {campaignData.product.images.map((fileObj: any) => {
                    const fileName = fileObj.file;
                    const fileUrl = `${BACKEND_URL}/uploads/${fileName}`;
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                      fileName
                    );
                    const isVideo = /\.(mp4|webm|mov|avi)$/i.test(fileName);
                    const has3DModel =
                      fileObj.three !== undefined && fileObj.three !== null;

                    return (
                      <div
                        key={fileObj._id}
                        className='bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col'
                      >
                        <div className='h-32 bg-gray-100 dark:bg-gray-700 relative'>
                          {' '}
                          {isImage ? (
                            <Image
                              src={fileUrl}
                              alt={`Product file ${fileName}`}
                              fill
                              sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                              className='object-cover object-center'
                            />
                          ) : isVideo ? (
                            <div className='w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700'>
                              <span className='text-gray-500 dark:text-gray-400 text-sm'>
                                Video File
                              </span>
                            </div>
                          ) : (
                            <div className='w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700'>
                              <FiFile
                                className='text-gray-500 dark:text-gray-400'
                                size={24}
                              />
                            </div>
                          )}
                        </div>
                        <div className='p-3 flex flex-col'>
                          <div className='flex justify-between items-center mb-2'>
                            <div
                              className='truncate text-sm text-gray-600 dark:text-gray-300'
                              title={fileName}
                            >
                              {fileName.length > 20
                                ? `${fileName.substring(0, 20)}...`
                                : fileName}
                            </div>
                            <a
                              href={fileUrl}
                              download
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300'
                            >
                              <FiDownload size={18} />
                            </a>
                          </div>
                          {isImage && (
                            <button
                              onClick={() =>
                                has3DModel
                                  ? handleView3DModel(fileName, fileObj.three)
                                  : handleGenerate3DModel(fileName)
                              }
                              disabled={
                                isGenerating3D &&
                                selectedFile.fileName === fileName
                              }
                              className={`mt-1 py-1.5 px-2 text-xs rounded flex items-center justify-center gap-1
                                ${
                                  has3DModel
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'border border-purple-600 text-purple-600 hover:bg-purple-600/10'
                                }
                                ${
                                  isGenerating3D &&
                                  selectedFile.fileName === fileName
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }
                              `}
                            >
                              {isGenerating3D &&
                              selectedFile.fileName === fileName ? (
                                <>
                                  <div className='animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-1'></div>
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <FaCube size={14} />
                                  {has3DModel ? 'View 3D Model' : 'Generate 3D'}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ContentSection>
            </ContentCard>
          )}

        <ApplicationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleApply}
          isSubmitting={isApplying}
          initialProposition={`Please feel free to check out my profile and let me know if you have any questions. Looking forward to the potential to work together!
Best,
${session?.user?.name || 'Your Name'}`}
          campaignDetails={{
            name: campaignData?.name,
            description: campaignData?.description,
            category: campaignData?.ecommerceCategory,
          }}
        />

        <ContentSubmissionModal
          campaignId={campaignData?._id}
          isOpen={isContentSubmissionModalOpen}
          onClose={() => setIsContentSubmissionModalOpen(false)}
        />

        <ThreeDViewerModal
          isOpen={isThreeDModalOpen}
          onClose={() => setIsThreeDModalOpen(false)}
          modelPath={selectedFile.threeDPath || ''}
          fileName={selectedFile.fileName}
        />

        {/* Close Campaign Confirmation Modal */}
        <Modal
          isOpen={showCloseConfirmModal}
          onClose={() => setShowCloseConfirmModal(false)}
          title='Close Campaign'
        >
          <div className='p-4'>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              Are you sure you want to close the campaign{' '}
              <span className='font-semibold'>"{campaignData?.name}"</span>?
            </p>
            <p className='mb-6 text-sm text-gray-600 dark:text-gray-400'>
              Closing this campaign will:
            </p>
            <ul className='mb-6 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1'>
              <li>Stop accepting new applications from influencers</li>
              <li>Mark the campaign as completed</li>
              <li>This action cannot be undone</li>
            </ul>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setShowCloseConfirmModal(false)}
                className='px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors'
                disabled={isClosingCampaign}
              >
                Cancel
              </button>
              <button
                onClick={handleCloseCampaign}
                className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors'
                disabled={isClosingCampaign}
              >
                {isClosingCampaign ? 'Closing...' : 'Close Campaign'}
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
