'use client';
import React from 'react';

interface TextAreaProps {
  placeholder?: string;
  labelPosition?: 'top' | 'left';
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label?: string | React.ReactNode;
  name?: string;
  className?: {
    textarea?: string;
    container?: string;
    label?: string;
  };
  id?: string;
  required?: boolean;
  info?: string;
  error?: string | null;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  cols?: number;
  rows?: number;
  disabled?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  placeholder = '',
  labelPosition = 'top',
  value,
  onChange,
  label,
  name,
  className = {
    container: '',
    label: '',
    textarea: '',
  },
  id,
  required = false,
  info,
  error,
  onBlur,
  cols = 30,
  rows = 5,
  disabled = false,
}) => {
  return (
    <div
      className={`flex w-full md:gap-1 ${
        labelPosition === 'left' ? 'flex-row !gap-10 items-center' : 'flex-col'
      } ${className?.container}`}
    >
      {label && (
        <label
          htmlFor={name}
          className={`w-auto text-xs font-semibold text-slate-800 dark:text-slate-200 ${className?.label}`}
        >
          {label}
        </label>
      )}
      <div className={`relative flex-1`}>
        <textarea
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          id={id}
          className={`w-full px-3 py-2 rounded-md shadow-sm border text-[14px] border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none ${
            disabled ? 'cursor-not-allowed dark:bg-gray-700' : ''
          } ${className?.textarea}`}
          required={required}
          onBlur={onBlur}
          rows={rows}
          cols={cols}
        />
      </div>
      {info && (
        <p className='text-slate-600 dark:text-slate-300 text-xs'>{info}</p>
      )}
      {error && <p className='text-red-600 text-xs'>{error}</p>}
    </div>
  );
};

export default TextArea;
