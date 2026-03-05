import React, { useState } from 'react';
import Modal from '@/components/modals/Modal';
import Button from '@/components/ui/button';
import { InfluencerListType } from './InfluencerListCard';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  list: InfluencerListType | null;
}

const DeleteListModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  list,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting list:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Delete Influencer List'>
      <div className='space-y-4'>
        <p className='text-gray-700 dark:text-gray-300'>
          Are you sure you want to delete the list "{list?.name}"? This action
          cannot be undone.
        </p>

        <div className='flex justify-end gap-2 mt-4'>
          <Button variant='outlined' onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            user='influencer'
            color='danger'
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete List'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteListModal;
