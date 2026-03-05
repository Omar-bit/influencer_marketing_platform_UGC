import React, { useState, useRef } from 'react';
import Modal from './Modal';
import Button from '@/components/ui/button';
import { FiX, FiUpload, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { submitCampaignContent } from '@/utils/api/handlers/campaignContent';

interface ContentSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

const ContentSubmissionModal: React.FC<ContentSubmissionModalProps> = ({
  isOpen,
  onClose,
  campaignId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collaborator, setCollaborator] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      const invalidFiles = newFiles.filter((file) => {
        const validTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'application/pdf',
        ];
        const isValidType = validTypes.includes(file.type);
        const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit

        return !isValidType || !isValidSize;
      });

      if (invalidFiles.length > 0) {
        toast.error(
          'Some files were rejected. Please upload images, videos (MP4), or PDFs under 50MB.'
        );
      }

      const validFiles = newFiles.filter((file) => {
        const validTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'application/pdf',
        ];
        const isValidType = validTypes.includes(file.type);
        const isValidSize = file.size <= 50 * 1024 * 1024;

        return isValidType && isValidSize;
      });

      setFiles([...files, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please provide a title for your content');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description for your content');
      return;
    }

    if (files.length === 0) {
      toast.error('Please upload at least one content asset');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);

      if (collaborator.trim()) {
        formData.append('collaborator', collaborator);
      }

      formData.append('tags', JSON.stringify(tags));

      if (additionalNotes.trim()) {
        formData.append('additionalNotes', additionalNotes);
      }

      files.forEach((file) => {
        formData.append('contentAssets', file);
      });

      const response = await submitCampaignContent(campaignId, formData);

      toast.success('Content submitted successfully!');

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting content:', error);
      toast.error('Failed to submit content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCollaborator('');
    setTags([]);
    setTagInput('');
    setFiles([]);
    setAdditionalNotes('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Submit Content'>
      <form onSubmit={handleSubmit}>
        <div className='p-6 space-y-6'>
          <h2 className='text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200'>
            Submit Content For Campaign
          </h2>
          {/* <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
            Campaign: "{campaignName}"
          </p> */}

          {/* Content Title */}
          <div>
            <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
              Content Title
            </label>
            <input
              type='text'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              placeholder='Enter the title of your content submission'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              Provide clear title for your content submission.
            </p>
          </div>

          {/* Content Description */}
          <div>
            <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
              Content Description
            </label>
            <textarea
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              placeholder='Describe your content and how it meets campaign requirements'
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              Provide details about your content and how it aligns with the
              campaign goals.
            </p>
          </div>

          {/* Collaborator */}
          <div>
            <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
              Collaborator
            </label>
            <input
              type='text'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              placeholder='Enter collaborator name (optional)'
              value={collaborator}
              onChange={(e) => setCollaborator(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
              Tags
            </label>
            <div className='flex flex-wrap gap-2 mb-2'>
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className='bg-pink-100 text-pink-800 px-2 py-1 rounded-md flex items-center text-sm'
                >
                  {tag}
                  <button
                    type='button'
                    className='ml-1 text-pink-600 hover:text-pink-800'
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
            <input
              type='text'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              placeholder='Type tags and press Enter'
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>

          {/* Upload Content */}
          <div>
            <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
              Upload your Content
            </label>
            <div
              className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-pink-400 transition-colors'
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type='file'
                multiple
                className='hidden'
                ref={fileInputRef}
                onChange={handleFileChange}
                accept='image/*, video/mp4, application/pdf'
              />
              <FiUpload className='mx-auto h-10 w-10 text-gray-400' />
              <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
                Click to upload or drag and drop
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                PNG, JPG, GIF, MP4, PDF up to 50MB
              </p>
            </div>

            {/* File Preview */}
            {files.length > 0 && (
              <div className='mt-4 space-y-2'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Uploaded Files:
                </label>
                <ul className='divide-y divide-gray-200 dark:divide-gray-700'>
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className='py-2 flex justify-between items-center'
                    >
                      <div className='flex items-center space-x-2'>
                        <span className='text-sm truncate max-w-xs'>
                          {file.name}
                        </span>
                        <span className='text-xs text-gray-500'>
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type='button'
                        className='text-red-500 hover:text-red-700'
                        onClick={() => handleRemoveFile(index)}
                      >
                        <FiX size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
              Additional Notes (OPTIONAL)
            </label>
            <textarea
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              placeholder='Any additional details or context about your submission'
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className='flex justify-end items-center gap-3 p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700'>
          <Button
            variant='outlined'
            onClick={onClose}
            disabled={isSubmitting}
            className='px-4'
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isSubmitting} className='px-4'>
            {isSubmitting ? 'Submitting...' : 'Submit Content'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContentSubmissionModal;
