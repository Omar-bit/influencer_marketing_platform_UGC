'use client';
import { useEffect, useState } from 'react';
import {
  getPlans,
  subscribeToPlan,
  upgradePlan,
  cancelSubscription,
  getMySubscription,
} from '@/utils/api/handlers/subscription';
import { getCurrentUser } from '@/utils/api/handlers/user';
import { FaCheck } from 'react-icons/fa';
import Button from '@/components/ui/button';

interface Plan {
  _id: string;
  name: string;
  price: number;
  campaignLimit: number | null;
  description?: string;
  features?: string[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Default plans to show during loading or if API fails
  const defaultPlans: Plan[] = [
    {
      _id: '1',
      name: 'Launch Kit',
      price: 310,
      campaignLimit: 2,
      description: 'For small eCommerce brands',
      features: [
        'Perfect for startups',
        'Essential marketing tools',
        'Basic analytics',
        'Email support',
      ],
    },
    {
      _id: '2',
      name: 'Growth Engine',
      price: 925,
      campaignLimit: 5,
      description: 'For mid-size brands',
      features: [
        'Everything in Launch Kit',
        'Advanced marketing automation',
        'Comprehensive analytics',
        'Priority email & chat support',
        'Personalized onboarding',
      ],
    },
    {
      _id: '3',
      name: 'Pro Commerce Hub',
      price: 2475,
      campaignLimit: null,
      description: 'For scaling stores & teams',
      features: [
        'Everything in Growth Engine',
        'Enterprise-grade infrastructure',
        'Advanced AI tools & insights',
        'Dedicated account manager',
        '24/7 premium support',
        'Custom integrations',
      ],
    },
  ];

  useEffect(() => {
    getPlans()
      .then((data) => {
        console.log('plans data', data);

        if (data.success) setPlans(data.data);
        else {
          setError(data.message);
          setPlans(defaultPlans);
        }
      })
      .catch(() => {
        setError('Failed to load plans');
        setPlans(defaultPlans);
      })
      .finally(() => setLoading(false));
    getMySubscription()
      .then((data) => {
        console.log('data', data);
        setCurrentPlan(data.data.plan.name);
      })
      .catch(() => {
        setError('Failed to load subscription data');
        setPlans(defaultPlans);
      })
      .finally(() => setLoading(false));
    // getCurrentUser()
    //   .then((data) => {
    //     if (data.success && data.data?.subscriptionPlan)
    //       setCurrentPlan(data.data.subscriptionPlan);
    //   })
    //   .catch(() => {});
  }, []);

  const handleSubscribe = async (planId: string) => {
    setActionMessage(null);
    setPaymentUrl(null);
    setSelectedPlan(planId);
    setIsProcessing(true);

    try {
      const data = await subscribeToPlan(planId);
      if (data.success && data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        setActionMessage(data.message);
      }
    } catch (err) {
      setActionMessage('Failed to process subscription request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setActionMessage(null);
    setPaymentUrl(null);
    setSelectedPlan(planId);
    setIsProcessing(true);

    try {
      const data = await upgradePlan(planId);
      if (data.success && data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else if (data.success) {
        setActionMessage('Upgraded successfully!');
      } else {
        setActionMessage(data.message);
      }
    } catch (err) {
      setActionMessage('Failed to process upgrade request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setActionMessage(null);
    setPaymentUrl(null);
    setIsProcessing(true);

    try {
      const data = await cancelSubscription();
      if (data.success) setActionMessage('Subscription cancelled.');
      else setActionMessage(data.message);
    } catch (err) {
      setActionMessage('Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-[60vh]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800'></div>
      </div>
    );
  }

  return (
    <div className='w-full '>
      {/* Header Banner */}
      <div className='w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-8 px-4 text-center mb-10'>
        <h1 className='text-3xl font-bold mb-2'>Choose Your Growth Plan</h1>
        <p className='text-lg'>
          Supercharge your eCommerce business with our tailored solutions
        </p>
      </div>

      {error && (
        <div className='max-w-6xl mx-auto px-4 mb-6 text-red-500 text-center'>
          {error}
        </div>
      )}
      {actionMessage && (
        <div className='max-w-6xl mx-auto px-4 mb-6 text-blue-600 dark:text-blue-400 text-center'>
          {actionMessage}
        </div>
      )}

      {/* Plans Grid */}
      <div className='max-w-6xl mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
          {plans.map((plan, index) => {
            // Calculate annual price (showing 12 months billed annually)
            const annualPrice = Math.round(plan.price * 12);
            const isMostPopular = index === 1; // Mark Growth Engine as most popular

            return (
              <div
                key={plan._id}
                className={`border relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-brand-primary_10 ${
                  isMostPopular
                    ? 'border-pink-400 most-popular'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className='p-6 flex flex-col h-full'>
                  <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 mb-2'>
                    {plan.name}
                  </h2>
                  <p className='text-gray-600 dark:text-gray-300 text-sm mb-4'>
                    {plan.description}
                  </p>
                  <p className='text-gray-500 dark:text-gray-400 text-xs'>{`(${
                    plan.campaignLimit
                      ? plan._id === '1'
                        ? '1-10K'
                        : '10K-75K'
                      : '75K+'
                  }/month)`}</p>

                  <div className='mt-4 mb-6'>
                    <div className='flex items-baseline'>
                      <span className='text-3xl font-bold text-gray-900 dark:text-white'>
                        {plan.price}
                      </span>
                      <span className='ml-1 text-gray-600 dark:text-gray-400'>
                        TND/month
                      </span>
                    </div>
                    {/* <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                      or ~{annualPrice} TND billed annually
                    </p> */}
                  </div>

                  {/* <p className='text-pink-500 dark:text-pink-400 text-xs font-medium mb-4'>
                    First {plan._id === '3' ? '3' : '2'} campaigns free!
                  </p> */}

                  <ul className='space-y-2 flex-grow'>
                    {plan.features?.map((feature, idx) => (
                      <li key={idx} className='flex items-center'>
                        <span className='text-green-500 dark:text-green-400 mr-2'>
                          <FaCheck size={12} />
                        </span>
                        <span className='text-sm text-gray-700 dark:text-gray-300'>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {currentPlan !== plan.name ? (
                    <button
                      onClick={() => handleSubscribe(plan._id)}
                      disabled={isProcessing || selectedPlan === plan._id}
                      className={`w-full py-2 rounded text-center font-medium transition-colors ${
                        isProcessing && selectedPlan === plan._id
                          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {isProcessing && selectedPlan === plan._id
                        ? 'Processing...'
                        : 'Get Started'}
                    </button>
                  ) : (
                    <Button
                      disabled
                      variant='outlined'
                      color='secondary'
                      user='brand'
                    >
                      Currently on
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className='text-sm text-gray-500 dark:text-gray-400 text-center mb-10'>
          3 months minimum engagement. To change plans or unsubscribe, please
          communicate your request at least 7 days in advance.
        </p>

        {/* FAQ Section */}
        <div className='mb-10'>
          <h2 className='text-xl font-bold text-purple-700 dark:text-purple-400 mb-4'>
            Frequently Asked Questions
          </h2>

          <div className='space-y-4'>
            <div>
              <h3 className='font-medium text-gray-800 dark:text-gray-200'>
                What does "2 first campaigns free" mean?
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                When you start with any of our plans, your first two marketing
                campaigns will be completely free of charge, helping you
                experience our platform's potential before investing more.
              </p>
            </div>

            <div>
              <h3 className='font-medium text-gray-800 dark:text-gray-200'>
                How do I determine which plan is right for my business?
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                The plans are structured based on your monthly revenue. If your
                store generates less than 10K per month, the Launch Kit is
                perfect for you. For 10K-75K monthly revenue, the Growth Engine
                offers the comprehensive tools you need.
              </p>
            </div>

            <div>
              <h3 className='font-medium text-gray-800 dark:text-gray-200'>
                Can I switch plans later?
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                Yes, you can upgrade or downgrade your plan as your business
                needs change. Please notify us at least 7 days before you want
                the change to take effect.
              </p>
            </div>
          </div>
        </div>

        {/* {currentPlan && (
          <div className='text-center mb-8'>
            <button
              onClick={handleCancel}
              className='bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition-colors'
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Cancel Current Subscription'}
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
}
