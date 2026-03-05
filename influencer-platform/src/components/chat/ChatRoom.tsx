'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  getMessages,
  sendMessage,
  getChatRoomById,
} from '@/utils/api/handlers/chat';
import ChatMessage from './ChatMessage';
import NegotiationMessage from './NegotiationMessage';
import { useSocket } from '@/providers/SocketProvider';
import { BACKEND_URL } from '@/utils/secrets';
import ProfilePicture from '../shared/ProfilePicture/ProfilePicture';
import Image from 'next/image';
import { DEFAULT_CAMPAIGN_IMAGE } from '@/utils/constants';
import NegotiationDialog from './NegotiationDialog';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  createdAt: string;
  read: boolean;
  type?: 'text' | 'negotiate' | 'negotiate_response';
  negotiation?: {
    price?: number;
    reason?: string;
    status?: 'pending' | 'accepted' | 'declined';
  };
}

interface ChatRoomData {
  _id: string;
  campaign: {
    _id: string;
    title: string;
    name: string;
    image?: string;
  };
  brand: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  influencer: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
}

export default function ChatRoom() {
  const { roomId } = useParams();
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roomData, setRoomData] = useState<ChatRoomData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNegotiationDialog, setShowNegotiationDialog] = useState(false);

  // Fetch chat room data
  useEffect(() => {
    async function fetchChatRoom() {
      try {
        const response = await getChatRoomById(roomId as string);
        if (response.success) {
          setRoomData(response.data);
        } else {
          setError('Failed to load chat room');
        }
      } catch (err) {
        console.error('Error fetching chat room:', err);
        setError('An error occurred while loading the chat room');
      }
    }

    if (roomId) {
      fetchChatRoom();
    }
  }, [roomId]);

  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        const response = await getMessages(roomId as string);
        if (response.success) {
          setMessages(response.data);
        } else {
          setError('Failed to load messages');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('An error occurred while loading messages');
      } finally {
        setLoading(false);
      }
    }

    if (roomId) {
      fetchMessages();
    }
  }, [roomId]);

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    socket.emit('join-room', roomId);

    const handleNewMessage = (data: any) => {
      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    socket.on('receive-message', handleNewMessage);

    return () => {
      socket.emit('leave-room', roomId);
      socket.off('receive-message', handleNewMessage);
    };
  }, [socket, isConnected, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    //@ts-ignore
    if (!newMessage.trim() || !roomId || !session?.user?._id) return;

    try {
      const response = await sendMessage(roomId as string, newMessage);

      if (response.success) {
        if (socket && isConnected) {
          socket.emit('send-message', {
            roomId,
            message: response.data,
          });
        } else {
          setMessages((prev) => [...prev, response.data]);
        }
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleNegotiationSuccess = () => {
    setShowNegotiationDialog(false);
    // We don't need to manually add the message here as it will come through socket or refresh
  };
  // This function is now only used as a fallback
  const refreshMessages = async () => {
    try {
      // Only load messages if socket isn't connected, as real-time updates will handle it otherwise
      if (!socket || !isConnected) {
        const response = await getMessages(roomId as string);
        if (response.success) {
          setMessages(response.data);
        }
      }
    } catch (err) {
      console.error('Error refreshing messages:', err);
    }
  };

  // Check if the current user is the influencer
  //@ts-ignore
  const isInfluencer = session?.user?.type === 'influencer';

  if (loading && !roomData) {
    return (
      <div className='flex justify-center items-center h-full'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary'></div>
      </div>
    );
  }

  if (error) {
    return <div className='text-red-500 text-center p-4'>{error}</div>;
  }

  if (!roomData) {
    return <div className='text-center p-4'>Chat room not found</div>;
  }
  //@ts-ignore
  const otherUser =
    //@ts-ignore
    session?.user?._id === roomData.brand._id
      ? roomData.influencer
      : roomData.brand;

  return (
    <div className='flex flex-col h-full'>
      {/* Chat header */}
      <div className='flex items-center p-4 border-b border-gray-200 dark:border-gray-700'>
        <div className='relative flex-shrink-0'>
          <Image
            src={
              roomData.campaign.image
                ? `${BACKEND_URL}/uploads/${roomData.campaign.image}`
                : DEFAULT_CAMPAIGN_IMAGE
            }
            alt={
              roomData.campaign.title || roomData.campaign.name || 'Campaign'
            }
            className='w-12 h-12 rounded-full object-cover'
            width={48}
            height={48}
          />
        </div>

        <div className='ml-3 flex-1'>
          <h3 className='text-sm font-medium text-gray-900 dark:text-white'>
            {roomData.campaign.title || roomData.campaign.name}
          </h3>
          <div className='flex items-center text-xs text-gray-500 dark:text-gray-400'>
            <span>Chat with </span>

            <ProfilePicture
              src={
                otherUser.profilePicture
                  ? `${BACKEND_URL}/uploads/${otherUser.profilePicture}`
                  : ''
              }
              alt={otherUser.name}
              size='small'
              className={{ container: 'w-4 h-4 mr-1' }}
            />
            <span>{otherUser.name}</span>
          </div>
        </div>

        {/* Negotiation button for influencers */}
        {isInfluencer && (
          <button
            onClick={() => setShowNegotiationDialog(true)}
            className='px-3 py-1 bg-brand-primary text-white text-sm rounded-md hover:bg-brand-primary-dark'
          >
            Negotiate Price
          </button>
        )}
      </div>

      {/* Chat messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.length === 0 && !loading ? (
          <div className='text-center py-6 text-gray-500 dark:text-gray-400'>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) =>
            message.type === 'negotiate' ||
            message.type === 'negotiate_response' ? (
              <NegotiationMessage
                key={message._id}
                content={message.content}
                sender={message.sender}
                timestamp={message.createdAt}
                isRead={message.read}
                negotiation={{
                  requestedPrice: message.negotiation?.price || 0,
                  reason: message.negotiation?.reason || '',
                  status: message.negotiation?.status,
                  originalPrice: 0, // This would be set from the campaign budget
                }}
                type={message.type}
                roomId={roomId as string}
                onResponseSent={refreshMessages}
              />
            ) : (
              <ChatMessage
                key={message._id}
                content={message.content}
                sender={message.sender}
                timestamp={message.createdAt}
                isRead={message.read}
              />
            )
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
        <form onSubmit={handleSendMessage} className='flex items-center'>
          <input
            type='text'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder='Type your message...'
            className='flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-800 dark:text-white'
          />
          <button
            type='submit'
            disabled={!newMessage.trim()}
            className='bg-brand-primary text-white rounded-r-lg py-2 px-4 font-medium disabled:opacity-50'
          >
            Send
          </button>
        </form>
      </div>

      {/* Negotiation dialog */}
      {showNegotiationDialog && (
        <NegotiationDialog
          roomId={roomId as string}
          campaignId={roomData.campaign._id}
          onClose={() => setShowNegotiationDialog(false)}
          onSuccess={handleNegotiationSuccess}
        />
      )}
    </div>
  );
}
