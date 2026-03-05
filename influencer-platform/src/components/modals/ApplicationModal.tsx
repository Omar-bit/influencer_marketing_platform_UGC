'use client';
import React, { useState } from 'react';
import Button from '@/components/ui/button';
import Modal from './Modal';
import TextArea from '../ui/TextArea';
import { FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { generateAIProposal } from '@/utils/api/handlers/ai';
import { useSession } from 'next-auth/react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposition: string) => void;
  initialProposition?: string;
  isSubmitting?: boolean;
  campaignDetails?: {
    name?: string;
    description?: string;
    category?: string;
  };
}

export default function ApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  initialProposition = '',
  isSubmitting = false,
  campaignDetails,
}: ApplicationModalProps) {
  const { data: userData } = useSession();
  //@ts-ignore
  const userWallet = userData?.user?.walletId;

  const [proposition, setProposition] = useState(initialProposition);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePropositionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProposition(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(proposition);
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleGenerateAIProposal = async () => {
    if (!campaignDetails) {
      toast.error('Campaign details are required to generate a proposal');
      return;
    }

    setIsGenerating(true);
    try {
      const { data } = await generateAIProposal(campaignDetails);
      setProposition(data);
      toast.success('AI proposal generated successfully!');
    } catch (error) {
      console.error('Error generating AI proposal:', error);
      toast.error('Failed to generate AI proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Apply to Campaign'>
      {!userWallet ? (
        <p className='text-red-500 text-center py-3'>
          Wallet ID is required to apply to campaigns.
        </p>
      ) : (
        <>
          <TextArea
            className={{
              container: 'mb-2',
              textarea: 'focus:border-influencer-primary',
            }}
            label={
              <p>
                Proposition <span className='text-gray-400'>(Optional)</span>
              </p>
            }
            value={proposition}
            onChange={handlePropositionChange}
            placeholder="Proposition's Details"
            disabled={isSubmitting || isGenerating}
          />

          <div className='flex gap-2 mb-4'>
            <Button
              variant='outlined'
              className='flex items-center justify-center gap-2 flex-1'
              onClick={handleGenerateAIProposal}
              disabled={isSubmitting || isGenerating}
            >
              {isGenerating ? (
                <>
                  <FiLoader className='animate-spin' />
                  <span>Generating...</span>
                </>
              ) : (
                'Generate with AI'
              )}
            </Button>
          </div>

          <Button
            className='w-full'
            onClick={handleSubmit}
            disabled={isSubmitting || isGenerating}
          >
            {isSubmitting ? 'APPLYING...' : 'APPLY'}
          </Button>
        </>
      )}
    </Modal>
  );
}
