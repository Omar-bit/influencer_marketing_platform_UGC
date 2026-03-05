import React, { ReactNode } from 'react';
import { IoMdClose } from 'react-icons/io';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: {
    [key: string]: string | number | boolean | undefined;
  };
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <section
      className='modal-wrapper fixed  !m-0  inset-0 top-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <article className='bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full md:max-w-[40vw] max-h-[90vh] overflow-auto'>
        <header
          className={`flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 ${className?.header}`}
        >
          <h3
            className={`text-lg font-semibold text-gray-800 dark:text-gray-100 ${className?.headerTitle}`}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ${className?.headerClose}`}
            aria-label='Close'
          >
            <IoMdClose size={24} />
          </button>
        </header>

        <main className='p-2'>{children}</main>
      </article>
    </section>
  );
};

export default Modal;
