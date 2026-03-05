'use client';

import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { BACKEND_URL } from '@/utils/secrets';
import ProfilePicture from '../shared/ProfilePicture/ProfilePicture';
import { useState } from 'react';
import { sendMessage } from '@/utils/api/handlers/chat';
import { useSocket } from '@/providers/SocketProvider';

interface NegotiationMessageProps {
  content: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  timestamp: string;
  isRead: boolean;
  negotiation: {
    requestedPrice: number;
    reason: string;
    status?: 'pending' | 'accepted' | 'declined';
    originalPrice?: number;
  };
  type: 'negotiate' | 'negotiate_response';
  roomId: string;
  onResponseSent?: () => void;
}

export default function NegotiationMessage({
  content,
  sender,
  timestamp,
  isRead,
  negotiation,
  type,
  roomId,
  onResponseSent,
}: NegotiationMessageProps) {
  const { data: session } = useSession();
  //@ts-ignore
  const isCurrentUser = session?.user?._id === sender._id;
  //@ts-ignore
  const loggedInUserPicture = session?.user?.profilePicture; //@ts-ignore
  const userType = session?.user?.type;
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const { socket, isConnected } = useSocket();
  // Only show response options to brands when viewing a pending negotiation request
  const showResponseOptions =
    userType === 'business' &&
    !isCurrentUser &&
    type === 'negotiate' &&
    (!negotiation.status || negotiation.status === 'pending') &&
    !isAccepting &&
    !isDeclining;

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const response = await sendMessage(
        roomId,
        `I have accepted your price request of ${negotiation.requestedPrice} TND.`,
        'negotiate_response',
        {
          requestedPrice: negotiation.requestedPrice,
          reason: 'Price accepted',
          status: 'accepted',
          originalPrice: negotiation.originalPrice,
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

        if (onResponseSent) {
          onResponseSent();
        }
      }
    } catch (error) {
      console.error('Error accepting negotiation:', error);
    } finally {
      setIsAccepting(false);
    }
  };
  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      const response = await sendMessage(
        roomId,
        `I cannot accept your price request of ${negotiation.requestedPrice} TND.`,
        'negotiate_response',
        {
          requestedPrice: negotiation.requestedPrice,
          reason: 'Price request declined',
          status: 'declined',
          originalPrice: negotiation.originalPrice,
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

        if (onResponseSent) {
          onResponseSent();
        }
      }
    } catch (error) {
      console.error('Error declining negotiation:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div
      className={`flex items-end ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      {!isCurrentUser && (
        <div className='flex-shrink-0 mr-2'>
          <ProfilePicture
            src={
              sender.profilePicture
                ? `${BACKEND_URL}/uploads/${sender.profilePicture}`
                : ''
            }
            alt={sender.name}
            size='small'
            className={{ container: 'w-8 h-8' }}
          />
        </div>
      )}

      <div
        className={`max-w-[70%] ${
          isCurrentUser
            ? 'bg-brand-primary text-white rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-lg'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-tr-lg rounded-tl-sm rounded-br-lg rounded-bl-lg'
        }`}
      >
        {/* Negotiation header with badge */}
        <div className='px-4 pt-3 pb-1 border-b border-white/10 dark:border-gray-600 flex justify-between items-center'>
          <span className='text-xs font-semibold'>
            {type === 'negotiate'
              ? 'Price Negotiation Request'
              : 'Price Negotiation Response'}
          </span>
          {negotiation.status && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                negotiation.status === 'accepted'
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                  : negotiation.status === 'declined'
                  ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
              }`}
            >
              {negotiation.status.charAt(0).toUpperCase() +
                negotiation.status.slice(1)}
            </span>
          )}
        </div>

        {/* Negotiation content */}
        <div className='px-4 py-2 break-words'>
          <div className='mb-2'>{content}</div>

          <div className='bg-white/10 dark:bg-black/10 p-3 rounded-md text-sm'>
            {negotiation.originalPrice && (
              <div className='flex justify-between mb-1'>
                <span>Original Price:</span>
                <span className='font-medium'>
                  {negotiation.originalPrice}{' '}
                  <span className='text-xs'>TND</span>
                </span>
              </div>
            )}
            <div className='flex justify-between mb-1'>
              <span>
                {type === 'negotiate' ? 'Requested Price:' : 'Final Price:'}
              </span>
              <span className='font-medium'>
                {negotiation.requestedPrice}{' '}
                <span className='text-xs'>TND</span>
              </span>
            </div>
            {type === 'negotiate' && (
              <div className='mt-2'>
                <span className='text-xs opacity-80'>Reason:</span>
                <p className='mt-1'>{negotiation.reason}</p>
              </div>
            )}
          </div>

          {/* Response buttons for brands */}
          {showResponseOptions && (
            <div className='mt-3 flex space-x-2'>
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className='flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded-md text-sm font-medium'
              >
                {isAccepting ? 'Processing...' : 'Accept'}
              </button>
              <button
                onClick={handleDecline}
                disabled={isDeclining}
                className='flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded-md text-sm font-medium'
              >
                {isDeclining ? 'Processing...' : 'Decline'}
              </button>
            </div>
          )}
        </div>

        <div
          className={`text-xs px-4 pb-1 flex ${
            isCurrentUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span
            className={`${
              isCurrentUser
                ? 'text-white/70'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </span>

          {isCurrentUser && (
            <span className='ml-2'>
              {isRead ? (
                <svg
                  className='w-3 h-3 text-white/70'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm-7.75 7.75L6.8 11.3 5.38 12.7l4.87 4.87 1.42-1.42-1.42-1.4z' />
                </svg>
              ) : (
                <svg
                  className='w-3 h-3 text-white/70'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>

      {isCurrentUser && (
        <div className='flex-shrink-0 ml-2'>
          <ProfilePicture
            src={
              loggedInUserPicture
                ? `${BACKEND_URL}/uploads/${loggedInUserPicture}`
                : ''
            }
            alt={session?.user?.name || 'user'}
            size='small'
            className={{ container: 'w-8 h-8' }}
          />
        </div>
      )}
    </div>
  );
}
