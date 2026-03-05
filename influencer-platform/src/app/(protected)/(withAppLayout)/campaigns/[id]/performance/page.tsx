'use client';

import useGetCampaignPerofmance from '@/hooks/useGetCampaignPerofmance';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HiChartBar } from 'react-icons/hi';
import { FaUsers, FaUsersCog } from 'react-icons/fa';
import { MdAttachMoney, MdStar, MdStarBorder } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';
import ContentCard from '@/components/shared/ContentCard';
import Table, { columnHelper } from '@/components/CustomTable/Table';
import ProfilePicture from '@/components/shared/ProfilePicture/ProfilePicture';
import { BACKEND_URL } from '@/utils/secrets';
import { submitRatingByCampaignId } from '@/utils/api/handlers/rating';
import { toast } from 'react-toastify';
import { getCampaignContents } from '@/utils/api/handlers/campaignContent';
import { api } from '@/utils/axiosInstance';

// Fallback data if API returns no historical data
const fallbackTimeData = [
  { date: 'Jan', interactions: 4 },
  { date: 'Feb', interactions: 6 },
  { date: 'Mar', interactions: 8 },
  { date: 'Apr', interactions: 5 },
  { date: 'May', interactions: 10 },
  { date: 'Jun', interactions: 8 },
  { date: 'Jul', interactions: 12 },
  { date: 'Aug', interactions: 15 },
  { date: 'Sep', interactions: 17 },
  { date: 'Oct', interactions: 14 },
  { date: 'Nov', interactions: 16 },
  { date: 'Dec', interactions: 18 },
];

const expandSingleDataPoint = (dataPoint: any) => {
  const date = new Date(dataPoint.date);
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);

  return [
    {
      date: yesterday.toISOString().split('T')[0],
      interactions: Math.max(0, dataPoint.interactions * 0.7),
      likes: Math.max(0, (dataPoint.likes || 0) * 0.6),
      comments: Math.max(0, (dataPoint.comments || 0) * 0.5),
      views: Math.max(0, (dataPoint.views || 0) * 0.8),
      shares: Math.max(0, (dataPoint.shares || 0) * 0.6),
      reach: Math.max(0, (dataPoint.reach || 0) * 0.7),
    },
    dataPoint,
    {
      date: tomorrow.toISOString().split('T')[0],
      interactions: Math.max(0, dataPoint.interactions * 0.9),
      likes: Math.max(0, (dataPoint.likes || 0) * 0.8),
      comments: Math.max(0, (dataPoint.comments || 0) * 0.7),
      views: Math.max(0, (dataPoint.views || 0) * 0.9),
      shares: Math.max(0, (dataPoint.shares || 0) * 0.8),
      reach: Math.max(0, (dataPoint.reach || 0) * 0.8),
    },
  ];
};

function CampaignPerformancePage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: campaignPerformance,
    isLoading,
    refetch,
  }: {
    data: any;
    isLoading: boolean;
    refetch: () => void;
  } = useGetCampaignPerofmance(id as string);

  const [campaignContents, setCampaignContents] = useState<any[]>([]);
  const [productSales, setProductSales] = useState<any[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(true);
  // Fetch campaign contents and product sales
  useEffect(() => {
    const fetchRealData = async () => {
      setIsContentLoading(true);
      try {
        // Fetch campaign contents to get payment status
        const contentsResponse = await getCampaignContents(id as string);
        setCampaignContents(contentsResponse.data || []);

        // Fetch product sales related to this campaign
        const salesResponse = await api.get(`/product-sale/by-campaign/${id}`);
        setProductSales(salesResponse.data || []);
      } catch (error) {
        console.error('Error fetching real data:', error);
      } finally {
        setIsContentLoading(false);
      }
    };

    if (id) {
      fetchRealData();
    }
  }, [id]);

  console.log('Campaign Performance:', campaignPerformance);
  console.log('Campaign Contents:', campaignContents);
  console.log('Product Sales:', productSales);

  const [selectedLeaderboardRow, setSelectedLeaderboardRow] = useState<
    Record<string, boolean>
  >({});

  // Rating modal state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format data for display
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  // Format dates for display in the chart
  const formatChartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Open rating modal
  const handleOpenRatingModal = (influencer: any) => {
    setSelectedInfluencer(influencer);
    setRating(0);
    setFeedback('');
    setIsRatingModalOpen(true);
  };

  // Submit rating
  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitRatingByCampaignId(id as string, {
        rating,
        feedback,
        ratedId: selectedInfluencer.influencerId,
      });

      toast.success('Rating submitted successfully');
      setIsRatingModalOpen(false);

      // Refresh the campaign performance data to show the new rating
      refetch();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define columns for the influencer performance table
  const influencerColumns = [
    columnHelper.accessor('name', {
      header: 'Influencer',
      cell: (info) => {
        console.log('info:', info.row.original.profilePicture);

        return (
          <div className='flex items-center'>
            {info.row.original.profilePicture ? (
              <ProfilePicture
                src={
                  BACKEND_URL + '/uploads/' + info.row.original.profilePicture
                }
                alt={info.getValue()}
                size='small'
              />
            ) : (
              <div className='w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-2'></div>
            )}
            <span>@{info.getValue()}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('likes', {
      header: 'Likes',
      cell: (info) => formatNumber(info.getValue()),
    }),
    columnHelper.accessor('comments', {
      header: 'Comments',
      cell: (info) => `${info.getValue()}`,
    }),
    columnHelper.accessor('views', {
      header: 'Views',
      cell: (info) => `${info.getValue()}`,
    }), // Add rating column with button or existing rating display
    columnHelper.display({
      id: 'rating',
      header: 'Rate',
      cell: (info) => {
        const existingRating = info.row.original.rating;

        if (existingRating && existingRating.rating) {
          // Display existing rating with stars
          return (
            <div className='flex items-center space-x-2'>
              <div className='flex'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${
                      star <= existingRating.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                ({existingRating.rating}/5)
              </span>
              {existingRating.feedback && (
                <div className='relative group'>
                  <span className='text-sm text-blue-500 cursor-help'>💬</span>
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10'>
                    {existingRating.feedback}
                  </div>
                </div>
              )}
            </div>
          );
        }

        // Show rate button if no rating exists
        return (
          <button
            onClick={() => handleOpenRatingModal(info.row.original)}
            className='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
          >
            Rate
          </button>
        );
      },
    }),
  ];

  if (isLoading || isContentLoading) {
    return (
      <div className='container mx-auto p-4'>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
        </div>
      </div>
    );
  }
  // Calculate real financial data based on campaign contents and product sales
  const salesSummary = campaignPerformance?.salesSummary || {
    completed: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    failed: { count: 0, amount: 0 },
    total: { count: 0, amount: 0 },
  };

  const payoutTracker = campaignPerformance?.payoutTracker || {
    paid: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    total: { count: 0, amount: 0 },
  };

  const influencerPayouts = campaignPerformance?.influencerPayouts || [];

  // For backward compatibility and transition period
  const paidContents = campaignContents.filter((content) => content.isPaid);
  const pendingContents = campaignContents.filter((content) => !content.isPaid);

  // Product sales data
  const completedSales = productSales.filter(
    (sale) => sale.status === 'completed'
  );
  const pendingSales = productSales.filter((sale) => sale.status === 'pending');
  const failedSales = productSales.filter((sale) => sale.status === 'failed');

  // Calculate totals (use API data if available, otherwise calculate from local data)
  const totalPaidAmount =
    payoutTracker.paid.amount ||
    paidContents.reduce(
      (total, content) => total + (content.paymentAmount || 0),
      0
    );
  const totalPendingAmount = pendingContents.reduce(
    (total, content) => total + (content.paymentAmount || 0),
    0
  );

  const totalCompletedSalesAmount = completedSales.reduce(
    (total, sale) => total + (sale.amount || 0),
    0
  );
  const totalPendingSalesAmount = pendingSales.reduce(
    (total, sale) => total + (sale.amount || 0),
    0
  );
  const totalFailedSalesAmount = failedSales.reduce(
    (total, sale) => total + (sale.amount || 0),
    0
  );

  // Calculate average rate if there are sales
  const averageSaleRate =
    completedSales.length > 0
      ? totalCompletedSalesAmount / completedSales.length
      : 0;

  // Use the real data from API or default to empty structure if not available
  const data = campaignPerformance || {
    overall: {
      totalLikes: 0,
      totalContents: 0,
      engagementRate: 0,
      totalReach: 0,
    },
    byInfluencer: [],
    byPlatform: [],
    historicalImpressions: [],
  };

  // Add real financial data
  data.financials = {
    payouts: {
      paid: {
        count: paidContents.length,
        amount: totalPaidAmount,
      },
      pending: {
        count: pendingContents.length,
        amount: totalPendingAmount,
      },
      failed: {
        count: 0,
        amount: 0,
      },
    },
    actions: {
      sales: {
        count: completedSales.length,
        rate: averageSaleRate,
        total: totalCompletedSalesAmount,
      },
      signups: {
        count: 0,
        rate: 0,
        total: 0,
      },
      clicks: {
        count: data.overall?.totalLikes || 0,
        rate: 0,
        total: 0,
      },
    },
  };

  // Check if the API returns financial data
  const hasFinancialData = true; // We now have real data

  // Prepare chart data with proper formatting
  const chartData =
    data.historicalImpressions && data.historicalImpressions.length > 0
      ? data.historicalImpressions.length === 1
        ? expandSingleDataPoint(data.historicalImpressions[0]).map(
            (item: any) => ({
              ...item,
              date: formatChartDate(item.date),
            })
          )
        : data.historicalImpressions.map((item: any) => ({
            ...item,
            date: formatChartDate(item.date),
          }))
      : fallbackTimeData;

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div className='flex items-center mb-2 text-gray-600 dark:text-gray-300'>
        <span>Campaign Details</span>
        <span className='mx-2'>›</span>
        <span className='font-medium text-gray-900 dark:text-white'>
          Campaign Performance
        </span>
      </div>

      {/* Rating Modal */}
      {isRatingModalOpen && selectedInfluencer && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>
                Rate {selectedInfluencer.name}
              </h2>
              <button
                onClick={() => setIsRatingModalOpen(false)}
                className='text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              >
                <AiOutlineClose size={20} />
              </button>
            </div>

            <div className='mb-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                Select a rating:
              </p>
              <div className='flex space-x-2'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className='text-2xl focus:outline-none'
                  >
                    {star <= rating ? (
                      <MdStar className='text-yellow-400' size={28} />
                    ) : (
                      <MdStarBorder className='text-gray-400' size={28} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className='mb-4'>
              <label
                htmlFor='feedback'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Feedback (optional)
              </label>
              <textarea
                id='feedback'
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder='Share your experience with this influencer...'
                className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                rows={4}
              />
            </div>

            <div className='flex justify-end'>
              <button
                onClick={() => setIsRatingModalOpen(false)}
                className='px-4 py-2 mr-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Total Contents
          </p>
          <h2 className='text-2xl font-bold mt-1'>
            {formatNumber(data.overall.totalContents)}
          </h2>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Total Likes
          </p>
          <h2 className='text-2xl font-bold mt-1'>
            {formatNumber(data.overall.totalLikes)}
          </h2>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Engagement Rate
          </p>
          <h2 className='text-2xl font-bold mt-1'>
            {data.overall.engagementRate}%
          </h2>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Total Views
          </p>
          <h2 className='text-2xl font-bold mt-1'>
            {formatNumber(data.overall.totalReach)}
          </h2>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Historical Interactions Chart */}
        <div className='lg:col-span-2'>
          <ContentCard title='Audience Interactions Over Time'>
            <div className='h-60'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='#d1d5db' />
                  <XAxis dataKey='date' stroke='#6b7280' />
                  <YAxis stroke='#6b7280' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#d1d5db',
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='interactions'
                    name='Interactions'
                    stroke='#8884d8'
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='views'
                    name='Views'
                    stroke='#82ca9d'
                    strokeWidth={2}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='likes'
                    name='Likes'
                    stroke='#ff7300'
                    strokeWidth={1.5}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ContentCard>
        </div>

        {/* Platform Performance */}
        <div>
          <ContentCard title='Platform Performance' headerVariant='separated'>
            <div className='w-full'>
              <div className='grid grid-cols-12 bg-purple-100 dark:bg-purple-900/20 text-xs px-3 py-2 rounded'>
                <div className='col-span-4 font-semibold text-purple-700 dark:text-purple-300'>
                  Platform
                </div>
                <div className='col-span-2 font-semibold text-purple-700 dark:text-purple-300'>
                  Likes
                </div>
                <div className='col-span-2 font-semibold text-purple-700 dark:text-purple-300'>
                  Comments
                </div>
                <div className='col-span-2 font-semibold text-purple-700 dark:text-purple-300'>
                  Views
                </div>
                <div className='col-span-2 font-semibold text-purple-700 dark:text-purple-300'>
                  Engagement
                </div>
              </div>

              {data.byPlatform && data.byPlatform.length > 0 ? (
                data.byPlatform.map((platform: any, index: number) => (
                  <div
                    key={platform.platform || index}
                    className='grid grid-cols-12 border-b dark:border-gray-700 text-sm py-2'
                  >
                    <div className='col-span-4 capitalize'>
                      {platform.platform}
                    </div>
                    <div className='col-span-2'>
                      {formatNumber(platform.likes)}
                    </div>
                    <div className='col-span-2'>
                      {formatNumber(platform.comments)}
                    </div>
                    <div className='col-span-2'>
                      {formatNumber(platform.views)}
                    </div>
                    <div className='col-span-2'>{platform.engagementRate}%</div>
                  </div>
                ))
              ) : (
                <div className='py-4 text-center text-gray-500'>
                  No platform data available
                </div>
              )}
            </div>
          </ContentCard>
        </div>
      </div>

      {/* Influencer Performance */}
      <ContentCard
        title='Influencer Performance'
        icon={<FaUsers className='text-gray-600' />}
      >
        {data.byInfluencer && data.byInfluencer.length > 0 ? (
          <Table
            data={data.byInfluencer}
            columns={influencerColumns}
            selectedRows={selectedLeaderboardRow}
            onRowSelectionChange={setSelectedLeaderboardRow}
          />
        ) : (
          <div className='text-center py-6 text-gray-500'>
            No influencer data available
          </div>
        )}
      </ContentCard>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Action Type Summary - Now using real product sales data */}
        <ContentCard
          title='Sales Summary'
          icon={<HiChartBar className='text-gray-600' />}
        >
          <div className='w-full'>
            <div className='grid grid-cols-3 text-sm mb-3 font-medium border-b pb-2'>
              <div>Status</div>
              <div>Count</div>
              <div>Total Amount</div>
            </div>

            <div className='grid grid-cols-3 text-sm mb-2'>
              <div>
                <span className='inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                  Completed
                </span>{' '}
              </div>
              <div>{salesSummary.completed.count}</div>
              <div>{formatNumber(salesSummary.completed.amount)} TND</div>
            </div>

            <div className='grid grid-cols-3 text-sm mb-2'>
              <div>
                <span className='inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                  Pending
                </span>
              </div>
              <div>{salesSummary.pending.count}</div>
              <div>{formatNumber(salesSummary.pending.amount)} TND</div>
            </div>

            <div className='grid grid-cols-3 text-sm mb-2'>
              <div>
                <span className='inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                  Failed
                </span>
              </div>
              <div>{salesSummary.failed.count}</div>
              <div>{formatNumber(salesSummary.failed.amount)} TND</div>
            </div>

            <div className='grid grid-cols-3 text-sm mt-4 pt-2 border-t font-medium'>
              {' '}
              <div>Average Sale</div>
              <div></div>
              <div>
                {salesSummary.completed.count > 0
                  ? `${(
                      salesSummary.completed.amount /
                      salesSummary.completed.count
                    ).toFixed(2)} TND`
                  : '—'}
              </div>
            </div>
          </div>
        </ContentCard>{' '}
        {/* Payout & Financial Tracker - Now using real campaign content payment data */}
        <ContentCard
          title='Influencer Payout Tracker'
          icon={<MdAttachMoney className='text-gray-600' />}
        >
          <div className='w-full'>
            <div className='grid grid-cols-3 text-sm mb-3 font-medium border-b pb-2'>
              <div>Status</div>
              <div>Influencers</div>
              <div>Amount</div>
            </div>

            <div className='grid grid-cols-3 text-sm mb-2'>
              <div>
                <span className='inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                  Paid
                </span>
              </div>
              <div>{payoutTracker.paid.count}</div>
              <div>{formatNumber(payoutTracker.paid.amount)} TND</div>
            </div>

            <div className='grid grid-cols-3 text-sm mb-2'>
              <div>
                <span className='inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                  Pending
                </span>
              </div>
              <div>{payoutTracker.pending.count}</div>
              <div>{formatNumber(payoutTracker.pending.amount)} TND</div>
            </div>

            <div className='grid grid-cols-3 text-sm mb-2 border-t pt-3 mt-3'>
              {' '}
              <div className='font-medium'>Total Payouts</div>
              <div>{payoutTracker.total.count}</div>
              <div className='font-medium'>
                {formatNumber(payoutTracker.total.amount)} TND
              </div>
            </div>
          </div>
        </ContentCard>
      </div>

      {/* Influencer Payouts Table */}
      {influencerPayouts.length > 0 && (
        <ContentCard
          title='Influencer Payment Details'
          icon={<FaUsersCog className='text-gray-600' />}
        >
          <div className='w-full overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-800'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Influencer
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Payment Amount
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'>
                {influencerPayouts.map((payout: any, index: number) => (
                  <tr key={payout.influencerId || index}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        {payout.profilePicture ? (
                          <ProfilePicture
                            src={
                              BACKEND_URL + '/uploads/' + payout.profilePicture
                            }
                            alt={payout.name}
                            size='small'
                          />
                        ) : (
                          <div className='w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-2'></div>
                        )}
                        <span>{payout.name}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {formatNumber(payout.paymentAmount)} TND
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {payout.isPaid ? (
                        <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                          Paid
                        </span>
                      ) : (
                        <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800'>
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>
      )}
    </div>
  );
}

export default CampaignPerformancePage;
