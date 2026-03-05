'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getSocialMediaMetrics } from '@/utils/api/handlers/user';
import { getPersonalProfile } from '@/utils/api/handlers/influencer';
import { SUPPORTED_SOCIAL_MEDIAS } from '@/utils/constants';
import { BACKEND_URL } from '@/utils/secrets';
import Button from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaArrowRight,
  FaRegCalendarAlt,
  FaRegClock,
  FaRegStar,
  FaUser,
} from 'react-icons/fa';
import {
  FaChartLine,
  FaChartSimple,
  FaCoins,
  FaDollarSign,
  FaEnvelope,
  FaHandshake,
} from 'react-icons/fa6';
import { IoMdTrendingUp } from 'react-icons/io';
import useGetInfluencerApplications from '@/hooks/useGetInfluencerApplications';
import useGetInfluencerIncomes from '@/hooks/useGetInfluencerIncomes';

function InfluencerHomePage() {
  const { data: session } = useSession();
  //@ts-ignore
  const userId = session?.user?._id;
  const [socialMediaData, setSocialMediaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: applications = [], isLoading: applicationsLoading } =
    useGetInfluencerApplications();
  const { data: incomes } = useGetInfluencerIncomes();

  useEffect(() => {
    async function fetchData() {
      if (!session?.user) return;

      try {
        setLoading(true);
        const metricsResponse = await getSocialMediaMetrics();
        if (metricsResponse?.success && metricsResponse?.data) {
          setSocialMediaData(metricsResponse.data);
        } else {
          setSocialMediaData([]);
        }

        if (userId) {
          const profileResponse = await getPersonalProfile(userId);
          if (profileResponse?.data) {
            setProfile(profileResponse.data);
          }
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err?.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session, userId]);

  const formatNumber = (num: number): string => {
    if (!num) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const pendingApplications =
    applications?.filter(
      (app: any) => app.status?.toLowerCase() === 'pending'
    ) || [];
  const acceptedApplications =
    applications?.filter(
      (app: any) => app.status?.toLowerCase() === 'accepted'
    ) || [];
  const rejectedApplications =
    applications?.filter(
      (app: any) => app.status?.toLowerCase() === 'rejected'
    ) || [];

  const totalEngagement = socialMediaData.reduce((sum, platform) => {
    return (
      sum + ((platform.followers || 0) * (platform.engagementRate || 0)) / 100
    );
  }, 0);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-[80vh]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800 dark:border-purple-400'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 text-center'>
        <div className='text-red-500 text-lg'>{error}</div>
        <Button
          user='influencer'
          color='primary'
          onClick={() => window.location.reload()}
          className='mt-4'
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className='p-4 md:p-6 space-y-6 max-w-full w-full dark:bg-gray-900'>
      {/* Welcome Header */}
      <div className='flex justify-between items-center flex-wrap gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold dark:text-white'>
            Welcome back, {profile?.name || 'Influencer'}
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Here's an overview of your performance and opportunities
          </p>
        </div>
        <Link href='/influencer/opportunities'>
          <Button
            user='influencer'
            color='primary'
            className='flex items-center gap-2'
          >
            <span>Explore Opportunities</span>
            <FaArrowRight className='size-4' />
          </Button>
        </Link>
      </div>

      {/* Stats Overview Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Total Followers */}
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Total Followers
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                {formatNumber(
                  socialMediaData.reduce(
                    (sum, platform) => sum + (platform.followers || 0),
                    0
                  )
                )}
              </h3>
            </div>
            <div className='p-2 bg-pink-100 dark:bg-pink-900 rounded-lg'>
              <FaUser className='text-pink-500 dark:text-pink-300 size-5' />
            </div>
          </div>
          <div className='mt-3 text-xs flex items-center text-green-500'>
            <IoMdTrendingUp className='mr-1' />
            <span>+{Math.floor(Math.random() * 10) + 2}% from last month</span>
          </div>
        </div>

        {/* Average Engagement Rate */}
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Avg. Engagement Rate
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                {socialMediaData.length > 0
                  ? (
                      socialMediaData.reduce(
                        (sum, platform) => sum + (platform.engagementRate || 0),
                        0
                      ) / socialMediaData.length
                    ).toFixed(2)
                  : '0'}
                %
              </h3>
            </div>
            <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
              <FaChartLine className='text-blue-500 dark:text-blue-300 size-5' />
            </div>
          </div>
          {/* <div className='mt-3 text-xs flex items-center text-green-500'>
            <IoMdTrendingUp className='mr-1' />
            <span>+{Math.floor(Math.random() * 5) + 1}% from last month</span>
          </div> */}
        </div>

        {/* Active Campaigns */}
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Active Campaigns
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                {acceptedApplications.length}
              </h3>
            </div>
            <div className='p-2 bg-purple-100 dark:bg-purple-900 rounded-lg'>
              <FaRegCalendarAlt className='text-purple-500 dark:text-purple-300 size-5' />
            </div>
          </div>
          <div className='mt-3 text-xs flex items-center'>
            <span className='text-gray-500 dark:text-gray-400'>
              {pendingApplications.length} pending applications
            </span>
          </div>
        </div>

        {/* Estimated Earnings */}
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Earnings
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                {incomes?.summary?.totalIncome?.toFixed(0)}TND
              </h3>
            </div>
            <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
              <FaDollarSign className='text-green-500 dark:text-green-300 size-5' />
            </div>
          </div>
          {/* <div className='mt-3 text-xs flex items-center text-green-500'>
            <IoMdTrendingUp className='mr-1' />
            <span>
              +{Math.floor(Math.random() * 15) + 5}% potential increase
            </span>
          </div> */}
        </div>
      </div>

      {/* Performance by Platform */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Social Media Performance */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 col-span-1 lg:col-span-2'>
          <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-lg font-semibold dark:text-white'>
              Social Media Performance
            </h2>
          </div>
          <div className='p-4'>
            {socialMediaData.length > 0 ? (
              <div className='space-y-6'>
                {socialMediaData.map((platform, index) => {
                  const socialMedia = SUPPORTED_SOCIAL_MEDIAS.find(
                    (s) =>
                      s.name.toLowerCase() === platform.platform.toLowerCase()
                  );

                  if (!socialMedia) return null;

                  const Icon = socialMedia.svg;
                  const engagementPercentage = platform.engagementRate || 0;

                  return (
                    <div key={index} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Icon
                            className='size-5'
                            style={{ color: socialMedia.background }}
                          />
                          <span className='font-medium dark:text-white'>
                            @{platform.username}
                          </span>
                        </div>
                        <div className='text-sm font-medium dark:text-white'>
                          {formatNumber(platform.followers)} followers
                        </div>
                      </div>

                      <div className='relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                        <div
                          className='absolute top-0 left-0 h-full rounded-full'
                          style={{
                            width: `${Math.min(
                              engagementPercentage * 5,
                              100
                            )}%`,
                            backgroundColor: socialMedia.background,
                          }}
                        ></div>
                      </div>

                      <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400'>
                        <div>Engagement Rate: {engagementPercentage}%</div>
                        {platform.likesCount && (
                          <div>Likes: {formatNumber(platform.likesCount)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='py-6 text-center'>
                <p className='text-gray-500 dark:text-gray-400 mb-4'>
                  Connect your social media accounts to see performance stats
                </p>
                <Link href='/influencer/profile'>
                  <Button user='influencer' color='primary' variant='outlined'>
                    Connect Accounts
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Applications */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-lg font-semibold dark:text-white'>
              Campaign Applications
            </h2>
          </div>
          <div className='p-4'>
            {applicationsLoading ? (
              <div className='py-8 flex justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-800 dark:border-purple-400'></div>
              </div>
            ) : applications && applications.length > 0 ? (
              <div className='space-y-2'>
                <div className='flex items-center gap-3 text-center'>
                  <div className='flex-1 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg'>
                    <div className='text-lg font-semibold text-yellow-600 dark:text-yellow-400'>
                      {pendingApplications.length}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      Pending
                    </div>
                  </div>
                  <div className='flex-1 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg'>
                    <div className='text-lg font-semibold text-green-600 dark:text-green-400'>
                      {acceptedApplications.length}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      Accepted
                    </div>
                  </div>
                  <div className='flex-1 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg'>
                    <div className='text-lg font-semibold text-red-600 dark:text-red-400'>
                      {rejectedApplications.length}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      Rejected
                    </div>
                  </div>
                </div>

                <div className='mt-4 space-y-3'>
                  <h3 className='font-medium text-sm dark:text-white'>
                    Recent Applications
                  </h3>
                  {applications.slice(0, 3).map((app: any, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg'
                    >
                      <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
                          {app.campaign?.image ? (
                            <Image
                              src={`${BACKEND_URL}/uploads/${app.campaign.image}`}
                              alt={app.campaign.name}
                              width={32}
                              height={32}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700'>
                              <FaRegCalendarAlt className='text-gray-500 dark:text-gray-400 size-4' />
                            </div>
                          )}
                        </div>
                        <div className='min-w-0'>
                          <div className='text-sm font-medium truncate dark:text-white'>
                            {app.campaign.name}
                          </div>
                          <div className='text-xs text-gray-500 dark:text-gray-400'>
                            {new Date(app.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          app.status.toLowerCase() === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                            : app.status.toLowerCase() === 'accepted'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}
                      >
                        {app.status}
                      </div>
                    </div>
                  ))}
                </div>

                <div className='pt-3 mt-2 border-t border-gray-200 dark:border-gray-700'>
                  <Link
                    href='/influencer/opportunities'
                    className='text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center justify-center gap-1'
                  >
                    <span>View all applications</span>
                    <FaArrowRight className='size-3' />
                  </Link>
                </div>
              </div>
            ) : (
              <div className='py-6 text-center'>
                <p className='text-gray-500 dark:text-gray-400 mb-4'>
                  No applications yet. Start applying to campaigns!
                </p>
                <Link href='/influencer/opportunities'>
                  <Button user='influencer' color='primary'>
                    Browse Opportunities
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activities */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Quick Actions */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-lg font-semibold dark:text-white'>
              Quick Actions
            </h2>
          </div>
          <div className='p-4 space-y-3'>
            <Link
              href='/influencer/opportunities'
              className='flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            >
              <div className='p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg mr-3'>
                <FaChartSimple className='text-purple-500 dark:text-purple-300 size-4' />
              </div>
              <div>
                <div className='text-sm font-medium dark:text-white'>
                  Browse Campaigns
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>
                  Find new opportunities
                </div>
              </div>
            </Link>

            <Link
              href='/influencer/profile'
              className='flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            >
              <div className='p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-3'>
                <FaUser className='text-blue-500 dark:text-blue-300 size-4' />
              </div>
              <div>
                <div className='text-sm font-medium dark:text-white'>
                  Update Profile
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>
                  Keep your info current
                </div>
              </div>
            </Link>

            <Link
              href='/chat'
              className='flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            >
              <div className='p-2 bg-green-100 dark:bg-green-900/50 rounded-lg mr-3'>
                <FaEnvelope className='text-green-500 dark:text-green-300 size-4' />
              </div>
              <div>
                <div className='text-sm font-medium dark:text-white'>
                  Messages
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>
                  Chat with brands
                </div>
              </div>
            </Link>

            <Link
              href='/influencer/campaign/bookmarks'
              className='flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            >
              <div className='p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg mr-3'>
                <FaRegStar className='text-yellow-500 dark:text-yellow-300 size-4' />
              </div>
              <div>
                <div className='text-sm font-medium dark:text-white'>
                  Saved Campaigns
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>
                  View your bookmarks
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Growth Opportunities */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 col-span-1 lg:col-span-2'>
          <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-lg font-semibold dark:text-white'>
              Growth Opportunities
            </h2>
          </div>
          <div className='p-4'>
            <div className='space-y-4'>
              <div className='p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-100 dark:border-pink-900/50'>
                <div className='flex items-start gap-3'>
                  <div className='p-2 bg-white dark:bg-gray-800 rounded-lg'>
                    <FaCoins className='text-amber-500 size-5' />
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-900 dark:text-white'>
                      Monetization Potential
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      Based on your engagement rates, you could earn an
                      estimated ${(totalEngagement * 0.08).toFixed(0)} per
                      sponsored post.
                    </p>
                    <div className='mt-3'>
                      <Link href='/influencer/opportunities'>
                        <Button
                          user='influencer'
                          color='primary'
                          variant='outlined'
                          className='text-xs py-1'
                        >
                          Explore Opportunities
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className='p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50'>
                <div className='flex items-start gap-3'>
                  <div className='p-2 bg-white dark:bg-gray-800 rounded-lg'>
                    <FaHandshake className='text-blue-500 size-5' />
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-900 dark:text-white'>
                      Collaboration Insights
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      {socialMediaData.length > 0
                        ? `Your ${
                            socialMediaData.sort(
                              (a, b) =>
                                (b.engagementRate || 0) -
                                (a.engagementRate || 0)
                            )[0]?.platform
                          } account has the highest engagement. Focus on this platform for better results.`
                        : 'Connect your social media accounts to receive personalized collaboration insights.'}
                    </p>
                    <div className='mt-3'>
                      <Link href='/influencer/profile'>
                        <Button
                          user='influencer'
                          color='primary'
                          variant='outlined'
                          className='text-xs py-1'
                        >
                          Update Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className='p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg border border-green-100 dark:border-green-900/50'>
                <div className='flex items-start gap-3'>
                  <div className='p-2 bg-white dark:bg-gray-800 rounded-lg'>
                    <FaRegClock className='text-green-500 size-5' />
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-900 dark:text-white'>
                      Upcoming Trends
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      Seasonal campaigns are trending. Complete your profile to
                      receive personalized campaign recommendations.
                    </p>
                    <div className='mt-3'>
                      <Link href='/influencer/opportunities'>
                        <Button
                          user='influencer'
                          color='primary'
                          variant='outlined'
                          className='text-xs py-1'
                        >
                          Browse Campaigns
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfluencerHomePage;
