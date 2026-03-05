'use client';
import ContentCard, { InfoItem } from '@/components/shared/ContentCard';
import useGetInfluencerIncomes from '@/hooks/useGetInfluencerIncomes';
import React from 'react';
import {
  SkeletonCard,
  SkeletonImage,
  SkeletonText,
} from '@/components/shared/Skeleton';
import {
  FaMoneyBillWave,
  FaRegCalendarAlt,
  FaReceipt,
  FaCoins,
} from 'react-icons/fa';
import { formatDate } from '@/utils/date';
import Table, { columnHelper } from '@/components/CustomTable/Table';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

function InfluencerIncomesPage() {
  const { data, isLoading, error } = useGetInfluencerIncomes();
  console.log('Income data:', data);
  if (isLoading && !data) {
    return (
      <div className='space-y-6'>
        <SkeletonCard>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className='space-y-2'>
                <SkeletonText height='h-5' width='w-1/2' />
                <SkeletonText height='h-8' />
              </div>
            ))}
          </div>
        </SkeletonCard>

        <SkeletonCard>
          <SkeletonText height='h-6' width='w-1/4' className='mb-3' />
          <div className='space-y-2'>
            {[...Array(5)].map((_, idx) => (
              <SkeletonText key={idx} />
            ))}
          </div>
        </SkeletonCard>
      </div>
    );
  }
  // return <div>test</div>;
  const columns = [
    columnHelper.accessor('campaign.name', {
      header: 'CAMPAIGN',
      cell: (info) => {
        console.log('Campaign info:', info);

        return (
          info.row.original.campaign?._id && (
            <Link
              href={`/campaigns/${info.row.original.campaign?._id}`}
              className='text-sm font-medium text-blue-600 hover:underline'
            >
              {info.getValue()}
            </Link>
          )
        );
      },
    }),
    columnHelper.accessor('contentTitle', {
      header: 'CONTENT',
      cell: (info) => (
        <span className='text-sm font-medium'>{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('amount', {
      header: 'AMOUNT',
      cell: (info) => (
        <span className='text-sm font-medium'>TND {info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('paymentStatus', {
      header: 'STATUS',
      cell: (info) => {
        const status = info.getValue();
        return (
          <div
            className={status === 'paid' ? 'text-green-600' : 'text-yellow-600'}
          >
            <Badge>
              <span className='capitalize'>{status}</span>
            </Badge>
          </div>
        );
      },
    }),
    columnHelper.accessor('createdAt', {
      header: 'DATE',
      cell: (info) => (
        <span className='text-sm'>
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
  ];

  const filteredIncomes = !data?.incomes ? [] : data.incomes;

  if (error) {
    return (
      <div className='bg-red-50 p-4 rounded-md text-red-800'>
        There was an error loading your income data. Please refresh the page or
        try again later.
      </div>
    );
  }

  const summary = data?.summary || {
    totalIncome: 0,
    potentialIncome: 0,
    totalPaidContent: 0,
    totalPendingContent: 0,
    totalPostedContent: 0,
  };

  return (
    <div className='space-y-6'>
      <h1 className='text-xl font-bold text-brand-primary mb-4'>
        INCOME SUMMARY
      </h1>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start mb-2'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Total Income
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                TND {summary.totalIncome}
              </h3>
            </div>
            <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
              <FaMoneyBillWave className='text-green-500 dark:text-green-300 size-5' />
            </div>
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            From {summary.totalPaidContent} paid content
            {summary.totalPaidContent !== 1 ? 's' : ''}
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start mb-2'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Pending Income
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                TND {summary.potentialIncome}
              </h3>
            </div>
            <div className='p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg'>
              <FaCoins className='text-yellow-500 dark:text-yellow-300 size-5' />
            </div>
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            From {summary.totalPendingContent} pending content
            {summary.totalPendingContent !== 1 ? 's' : ''}
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start mb-2'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Posted Content
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                {summary.totalPostedContent}
              </h3>
            </div>
            <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
              <FaRegCalendarAlt className='text-blue-500 dark:text-blue-300 size-5' />
            </div>
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            Total posted content pieces
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start mb-2'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Avg Income per Content
              </p>
              <h3 className='text-2xl font-bold mt-1 dark:text-white'>
                TND{' '}
                {summary.totalPaidContent > 0
                  ? Math.round(summary.totalIncome / summary.totalPaidContent)
                  : 0}
              </h3>
            </div>
            <div className='p-2 bg-purple-100 dark:bg-purple-900 rounded-lg'>
              <FaReceipt className='text-purple-500 dark:text-purple-300 size-5' />
            </div>
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            Average earnings per paid content
          </div>
        </div>
      </div>

      <ContentCard
        title='Income Transactions'
        headerVariant='separated'
        user='influencer'
        className='mt-8'
      >
        {filteredIncomes.length > 0 ? (
          <Table columns={columns} data={filteredIncomes} />
        ) : (
          <div className='py-6 text-center text-gray-500 dark:text-gray-400'>
            No income transactions found.
          </div>
        )}
      </ContentCard>
    </div>
  );
}

export default InfluencerIncomesPage;
