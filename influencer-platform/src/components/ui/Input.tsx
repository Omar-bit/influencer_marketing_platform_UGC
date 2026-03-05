'use client';
import React, { useState } from 'react';
import { LuEye } from 'react-icons/lu';
import { LuEyeClosed } from 'react-icons/lu';
import ImageUploadIcon from '@/assets/svg/image_upload.svg';
interface InputProps {
  type?: string;
  placeholder?: string;
  labelPosition?: 'top' | 'left';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  name?: string;
  className?: {
    input?: string;
    container?: string;
    label?: string;
  };
  id?: string;
  isDisabled?: boolean;
  required?: boolean;
  info?: string;
  error?: string | null;
  valid?: any;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  leftIcon?: React.ReactNode | null;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder = '',
  labelPosition = 'top',
  value,
  onChange,
  label,
  name,
  className = {
    container: '',
    label: '',
    input: '',
  },
  id,
  required = false,
  isDisabled = false,
  info,
  error,
  onBlur,
  leftIcon = null,
}) => {
  const [showPass, setShowPass] = useState(false);
  if (type === 'file') {
    return (
      <div>
        <label
          htmlFor='file'
          className='py-1 px-7 text-sm text-brand-primary rounded-lg border border-brand-primary flex items-center gap-2 hover:bg-brand-primary_10 dark:text-brand-primary dark:border-brand-primary'
        >
          <p>{label}</p>
          <ImageUploadIcon />

          <input
            type='file'
            value={value}
            onChange={onChange}
            id='file'
            name='file'
            className={` hidden ${className.input} `}
          />
        </label>
        {info && (
          <p className='text-slate-600 dark:text-slate-300 text-xs'>{info}</p>
        )}
        {error && <p className='text-red-600 text-xs'>{error}</p>}
      </div>
    );
  }
  return (
    <div
      className={`flex w-full md:gap-1 ${
        labelPosition === 'left' ? 'flex-row  items-center !gap-10' : 'flex-col'
      } ${className?.container}`}
    >
      {label && (
        <label
          htmlFor={name}
          className={`w-auto text-xs text-slate-800 dark:text-slate-200 font-semibold ${className?.label}`}
        >
          {label}
        </label>
      )}
      <div className={`relative flex-1`}>
        {leftIcon && (
          <span className='absolute left-3 top-[50%] -translate-y-[50%]'>
            {leftIcon}
          </span>
        )}
        <input
          type={type === 'password' ? (showPass ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          id={id}
          className={`w-full px-3 py-2 rounded-md shadow-sm border text-[14px] border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-brand-primary ${
            isDisabled && 'cursor-not-allowed dark:bg-gray-700'
          }  ${leftIcon && 'pl-8'} ${className?.input} `}
          required={required}
          onBlur={onBlur}
          disabled={isDisabled}
        />
        {type === 'password' && (
          <button
            className='text-[#6B7280] dark:text-gray-300 size-3 absolute right-3 top-[50%] -translate-y-[50%]'
            type='button'
            onClick={() => setShowPass((prev) => !prev)}
          >
            {showPass ? <LuEyeClosed /> : <LuEye />}
          </button>
        )}
      </div>
      {info && (
        <p className='text-slate-600 dark:text-slate-300 text-xs'>{info}</p>
      )}
      {error && <p className='text-red-600 text-xs'>{error}</p>}
    </div>
  );
};

export default Input;
