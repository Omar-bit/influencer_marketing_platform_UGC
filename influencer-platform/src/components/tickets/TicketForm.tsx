'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/button';
import Select from '@/components/ui/Select';
import {
  createTicket,
  TicketFormData,
  TicketType,
  TicketPriority,
} from '@/utils/api/handlers/ticket';
import { toast } from 'react-toastify';

export default function TicketForm() {
  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    description: '',
    type: 'question',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ticketTypeOptions = [
    { label: 'Question', value: 'question' },
    { label: 'Feedback', value: 'feedback' },
    { label: 'Bug Report', value: 'bug' },
    { label: 'Feature Request', value: 'feature' },
    { label: 'Other', value: 'other' },
  ];

  const priorityOptions = [
    { label: 'Low Priority', value: 'low' },
    { label: 'Medium Priority', value: 'medium' },
    { label: 'High Priority', value: 'high' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTypeChange = (selectedOption: any) => {
    setFormData({
      ...formData,
      type: selectedOption.value as TicketType,
    });
  };

  const handlePriorityChange = (selectedOption: any) => {
    setFormData({
      ...formData,
      priority: selectedOption.value as TicketPriority,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createTicket(formData);

      toast.success('Ticket submitted successfully');

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'question',
        priority: 'medium',
      });
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Failed to submit ticket. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
      <h2 className='text-xl font-semibold mb-4'>Submit a Support Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <Input
            label='Title'
            name='title'
            value={formData.title}
            onChange={handleInputChange}
            placeholder='Enter a title for your ticket'
            required
          />
        </div>

        <div className='mb-4'>
          <label className='block mb-2 text-sm font-medium'>Ticket Type</label>
          <Select
            options={ticketTypeOptions}
            value={ticketTypeOptions.find(
              (option) => option.value === formData.type
            )}
            setValue={handleTypeChange}
            placeholder='Select ticket type'
          />
        </div>

        <div className='mb-4'>
          <label className='block mb-2 text-sm font-medium'>Priority</label>
          <Select
            options={priorityOptions}
            value={priorityOptions.find(
              (option) => option.value === formData.priority
            )}
            setValue={handlePriorityChange}
            placeholder='Select priority'
          />
        </div>

        <div className='mb-4'>
          <TextArea
            label='Description'
            name='description'
            value={formData.description}
            onChange={handleTextAreaChange}
            placeholder='Describe your issue, feedback, or question in detail'
            rows={5}
            required
          />
        </div>

        <div className='flex justify-end'>
          <Button type='submit' disabled={isSubmitting} className='px-4 py-2'>
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </div>
      </form>
    </div>
  );
}
