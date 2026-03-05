'use client';

import { useState, useEffect } from 'react';
import { sendMessage } from '@/utils/api/handlers/chat';
import { getCampaignById } from '@/utils/api/handlers/campaign';
import { useSocket } from '@/providers/SocketProvider';

interface NegotiationDialogProps {
  roomId: string;
  campaignId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NegotiationDialog({
  roomId,
  campaignId,
  onClose,
  onSuccess,
}: NegotiationDialogProps) {
  const [price, setPrice] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    async function fetchCampaignDetails() {
      try {
        setIsLoadingCampaign(true);
        const response = await getCampaignById(campaignId);

        if (response.success) {
          setOriginalPrice(response.data.budget);
        } else {
          setError('Could not load campaign budget');
        }
      } catch (err) {
        console.error('Error fetching campaign details:', err);
        setError('An error occurred while loading campaign details');
      } finally {
        setIsLoadingCampaign(false);
      }
    }

    fetchCampaignDetails();
  }, [campaignId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!price || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for your price request');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const negotiationMessage = `I would like to propose a collaboration price of $${price}.`;
      const response = await sendMessage(
        roomId,
        negotiationMessage,
        'negotiate',
        {
          requestedPrice: Number(price),
          reason,
          originalPrice: originalPrice || undefined,
        }
      );

      if (response.success) {
        // Emit socket event to update the chat in real-time
        if (socket && isConnected) {
          socket.emit('send-message', {
            roomId,
            message: response.data,
          });
        }
        onSuccess();
      } else {
        setError(response.message || 'Failed to send negotiation request');
      }
    } catch (err: any) {
      console.error('Error sending negotiation:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl'>
        <div className='p-6'>
          <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            Negotiate Collaboration Price
          </h3>

          {isLoadingCampaign ? (
            <div className='flex justify-center py-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary'></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {originalPrice !== null && (
                <div className='mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md'>
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Original Budget:{' '}
                    <span className='font-bold'>${originalPrice}</span>
                  </span>
                </div>
              )}

              <div className='mb-4'>
                <label
                  htmlFor='price'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Your Requested Price ($)
                </label>
                <input
                  type='number'
                  id='price'
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value ? Number(e.target.value) : '')
                  }
                  className='w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-900'
                  placeholder='Enter amount'
                  min='1'
                  required
                />
              </div>

              <div className='mb-4'>
                <label
                  htmlFor='reason'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Reason for Price Request
                </label>
                <textarea
                  id='reason'
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className='w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-900 min-h-[100px]'
                  placeholder="Explain why you're requesting this price..."
                  required
                />
              </div>

              {error && (
                <div className='mb-4 text-sm text-red-500'>{error}</div>
              )}

              <div className='flex justify-end space-x-3'>
                <button
                  type='button'
                  onClick={onClose}
                  className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md font-medium'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-4 py-2 bg-brand-primary text-white rounded-md font-medium disabled:opacity-70'
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
