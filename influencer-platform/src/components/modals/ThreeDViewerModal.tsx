import React from 'react';
import Modal from './Modal';
import ThreeDViewer from '../ThreeDViewer';
import Button from '../ui/button';
import { FaCube } from 'react-icons/fa';

interface ThreeDViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelPath: string;
  fileName: string;
}

const ThreeDViewerModal: React.FC<ThreeDViewerModalProps> = ({
  isOpen,
  onClose,
  modelPath,
  fileName,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`3D View - ${fileName}`}
      className={{ header: 'bg-gray-100 dark:bg-gray-800' }}
    >
      <div className='p-1 sm:p-4'>
        <ThreeDViewer modelPath={modelPath} />
        <div className='mt-4 flex justify-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400 flex items-center'>
            <FaCube className='mr-2' />
            Use mouse to rotate, scroll to zoom, and right-click to pan
          </p>
        </div>
        <div className='mt-4 flex justify-end'>
          <Button onClick={onClose} className='px-4'>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ThreeDViewerModal;
