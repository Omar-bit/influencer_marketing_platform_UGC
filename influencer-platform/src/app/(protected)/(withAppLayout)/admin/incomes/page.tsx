'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiDollarSign } from 'react-icons/fi';
import { getAdminSubscriptionIncomes } from '@/utils/api/handlers/admin';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  offeredCampaigns: number | null;
}

interface Subscription {
  _id: string;
  userId: User;
  planId: SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: 'unpaid' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  remainingCampaigns: number;
  paymentRef?: string;
}

interface MonthlyData {
  month: string;
  year: number;
  income: number;
  subscriptions: number;
}

interface IncomeData {
  subscriptions: Subscription[];
  totalIncome: number;
  monthlyData: MonthlyData[];
}

export default function AdminIncomesPage() {
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<
    Subscription[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIncomeData();
  }, []);

  useEffect(() => {
    if (incomeData) {
      filterSubscriptions();
    }
  }, [searchTerm, incomeData]);

  const fetchIncomeData = async () => {
    try {
      setIsLoading(true);
      const { data } = await getAdminSubscriptionIncomes();
      setIncomeData(data);
      setFilteredSubscriptions(data.subscriptions);
      setError(null);
    } catch (err) {
      console.error('Error fetching income data:', err);
      setError('Failed to load income data');
      toast.error('Failed to load income data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubscriptions = () => {
    if (!incomeData) return;

    if (!searchTerm) {
      setFilteredSubscriptions(incomeData.subscriptions);
      return;
    }

    const filtered = incomeData.subscriptions.filter(
      (sub) =>
        sub.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.planId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.paymentRef &&
          sub.paymentRef.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredSubscriptions(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className='p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
      <h1 className='text-2xl font-bold mb-6 text-gray-800 dark:text-white'>
        Subscription Income Management
      </h1>

      {error && (
        <div
          className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'
          role='alert'
        >
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className='flex justify-center items-center h-40'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500'></div>
        </div>
      ) : (
        <>
          {/* Income Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4'>
                  <FiDollarSign className='text-green-600 dark:text-green-400' />
                </div>
                <div>
                  <p className='text-gray-500 dark:text-gray-400 text-sm font-medium'>
                    Total Income
                  </p>
                  <h3 className='text-2xl font-bold'>
                    {formatCurrency(incomeData?.totalIncome || 0)}
                  </h3>
                </div>
              </div>
            </div>

            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4'>
                  <FiDollarSign className='text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <p className='text-gray-500 dark:text-gray-400 text-sm font-medium'>
                    Total Subscriptions
                  </p>
                  <h3 className='text-2xl font-bold'>
                    {incomeData?.subscriptions.length || 0}
                  </h3>
                </div>
              </div>
            </div>

            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4'>
                  <FiDollarSign className='text-purple-600 dark:text-purple-400' />
                </div>
                <div>
                  <p className='text-gray-500 dark:text-gray-400 text-sm font-medium'>
                    Average Subscription Value
                  </p>
                  <h3 className='text-2xl font-bold'>
                    {formatCurrency(
                      incomeData && incomeData.subscriptions.length > 0
                        ? incomeData.totalIncome /
                            incomeData.subscriptions.length
                        : 0
                    )}
                  </h3>
                </div>
              </div>
            </div>
          </div>
          {/* Monthly Income Chart */}{' '}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8'>
            <h2 className='text-lg font-bold mb-4 text-gray-800 dark:text-white'>
              Monthly Income (Last 6 Months)
            </h2>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={incomeData?.monthlyData || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='month'
                    tickFormatter={(value) => value.substring(0, 3)}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Income',
                    ]}
                    labelFormatter={(value) =>
                      `${value} ${new Date().getFullYear()}`
                    }
                  />{' '}
                  <Legend />
                  <Line
                    name='Monthly Income'
                    type='monotone'
                    dataKey='income'
                    stroke='#8884d8'
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Subscription Table */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8'>
            <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
              <div className='flex flex-col md:flex-row justify-between gap-4'>
                <h2 className='text-lg font-bold text-gray-800 dark:text-white'>
                  Subscription Details
                </h2>
                <div className='relative'>
                  <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Search by name, email, plan...'
                    className='pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-700'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Customer
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Plan
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Price
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Start Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      End Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Payment Ref
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                  {filteredSubscriptions.length > 0 ? (
                    filteredSubscriptions.map((subscription) => (
                      <tr
                        key={subscription._id}
                        className='hover:bg-gray-50 dark:hover:bg-gray-700'
                      >
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div>
                            <div className='text-sm font-medium text-gray-900 dark:text-white'>
                              {subscription.userId.name}
                            </div>
                            <div className='text-sm text-gray-500 dark:text-gray-400'>
                              {subscription.userId.email}
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
                            {subscription.planId.name}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                          {formatCurrency(subscription.planId.price)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                          {formatDate(subscription.startDate)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                          {formatDate(subscription.endDate)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                          {subscription.paymentRef || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className='px-6 py-4 text-center text-gray-500 dark:text-gray-400'
                      >
                        No subscriptions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
