'use client';

import React, { useEffect, useState } from 'react';
import {
  getProductSales,
  getProductFinancialStats,
} from '@/utils/api/handlers/product';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '@/utils/secrets';
import Image from 'next/image';
import BackLink from '@/components/ui/BackLink';

interface ProductSale {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: { file: string }[];
  };
  buyer: {
    email: string;
    name?: string;
  };
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  influencer?: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  createdAt: string;
}

interface FinancialStats {
  totalRevenue: number;
  pendingPayouts: number;
  completedPayouts: number;
  failedPayouts: number;
  actionTypeSummary: {
    directSales: number;
    influencerSales: number;
    pendingSales: number;
    completedSales: number;
    failedSales: number;
  };
}

export default function ProductSalesPage() {
  const [sales, setSales] = useState<ProductSale[]>([]);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesResponse, statsResponse] = await Promise.all([
          getProductSales(),
          getProductFinancialStats(),
        ]);

        if (salesResponse.success) {
          setSales(salesResponse.data);
        } else {
          setError(salesResponse.message || 'Failed to fetch sales');
          toast.error(salesResponse.message || 'Failed to fetch sales');
        }

        if (statsResponse.success) {
          setFinancialStats(statsResponse.data);
        } else {
          toast.error(
            statsResponse.message || 'Failed to fetch financial stats'
          );
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data');
        toast.error(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='p-4'>
        <div className='mb-6'>
          <BackLink userType='brand' to='/brand/products' className='mr-4' />
        </div>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8'></div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='bg-gray-200 dark:bg-gray-700 h-24 rounded-lg'
              ></div>
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='bg-gray-200 dark:bg-gray-700 h-24 rounded-lg'
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4'>
        <div className='mb-6'>
          <BackLink userType='brand' to='/brand/products' className='mr-4' />
        </div>
        <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4'>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='mb-6 flex items-center'>
        <BackLink userType='brand' to='/brand/products' className='mr-4' />
        <h1 className='text-2xl md:text-3xl font-bold text-brand-primary'>
          Product Sales
        </h1>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>
            Total Sales
          </h3>
          <p className='text-3xl font-bold text-brand-primary'>
            {sales.length}
          </p>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>
            Completed Sales
          </h3>
          <p className='text-3xl font-bold text-green-600'>
            {financialStats?.actionTypeSummary.completedSales || 0}
          </p>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>
            Total Revenue
          </h3>
          <p className='text-3xl font-bold text-brand-primary'>
            {financialStats?.totalRevenue.toFixed(2) || '0.00'} TND
          </p>
        </div>
      </div>

      {/* Financial Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
        {/* Payout & Financial Tracker */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4'>
            Payout & Financial Tracker
          </h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>
                Total Revenue
              </span>
              <span className='font-semibold text-green-600'>
                {financialStats?.totalRevenue.toFixed(2) || '0.00'} TND
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>
                Pending Payouts
              </span>
              <span className='font-semibold text-yellow-600'>
                {financialStats?.pendingPayouts.toFixed(2) || '0.00'} TND
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>
                Completed Payouts
              </span>
              <span className='font-semibold text-green-600'>
                {financialStats?.completedPayouts.toFixed(2) || '0.00'} TND
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>
                Failed Payouts
              </span>
              <span className='font-semibold text-red-600'>
                {financialStats?.failedPayouts.toFixed(2) || '0.00'} TND
              </span>
            </div>
          </div>
        </div>

        {/* Action Type Summary */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4'>
            Action Type Summary
          </h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>
                Direct Sales
              </span>
              <span className='font-semibold'>
                {financialStats?.actionTypeSummary.directSales || 0}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>
                Influencer Sales
              </span>
              <span className='font-semibold'>
                {financialStats?.actionTypeSummary.influencerSales || 0}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>
                Pending Sales
              </span>
              <span className='font-semibold text-yellow-600'>
                {financialStats?.actionTypeSummary.pendingSales || 0}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>
                Completed Sales
              </span>
              <span className='font-semibold text-green-600'>
                {financialStats?.actionTypeSummary.completedSales || 0}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600 dark:text-gray-400'>
                Failed Sales
              </span>
              <span className='font-semibold text-red-600'>
                {financialStats?.actionTypeSummary.failedSales || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-700'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Product
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Buyer
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Amount
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Influencer
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Date
                </th>
              </tr>
            </thead>
            <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
              {sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-4 text-center text-gray-500 dark:text-gray-400'
                  >
                    No sales found
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='h-10 w-10 flex-shrink-0'>
                          {sale.product.images[0] && (
                            <Image
                              src={`${BACKEND_URL}/uploads/${sale.product.images[0].file}`}
                              alt={sale.product.name}
                              width={40}
                              height={40}
                              className='rounded-md object-cover'
                            />
                          )}
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900 dark:text-white'>
                            {sale.product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900 dark:text-white'>
                        {sale.buyer.name || 'N/A'}
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        {sale.buyer.email}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900 dark:text-white'>
                        {sale.amount.toFixed(2)} TND
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sale.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : sale.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {sale.status.charAt(0).toUpperCase() +
                          sale.status.slice(1)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {sale.influencer ? (
                        <div className='flex items-center'>
                          <div className='h-10 w-10 flex-shrink-0'>
                            {sale.influencer.profilePicture ? (
                              <Image
                                src={`${BACKEND_URL}/uploads/${sale.influencer.profilePicture}`}
                                alt={sale.influencer.name}
                                width={40}
                                height={40}
                                className='rounded-full object-cover'
                              />
                            ) : (
                              <div className='h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
                                <span className='text-gray-500 dark:text-gray-400'>
                                  {sale.influencer.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900 dark:text-white'>
                              {sale.influencer.name}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className='text-gray-500 dark:text-gray-400'>
                          Direct Sale
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
