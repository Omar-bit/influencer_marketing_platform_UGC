import React from 'react';

function CheckBox({ handleClick, value, title, description, label = '' }: any) {
  return (
    <div className='w-full space-y-2'>
      <label htmlFor='' className='dark:text-gray-200'>
        {label}
      </label>
      <button
        className='flex w-full items-center gap-5 rounded-md border border-brand-primary px-3 py-2 dark:border-brand-primary dark:bg-gray-800'
        onClick={handleClick}
      >
        <div className='size-5 border rounded-full border-brand-primary flex justify-center items-center dark:border-brand-primary'>
          {value && (
            <div className='size-3 bg-brand-primary rounded-full'></div>
          )}
        </div>
        <div className='flex flex-col gap-1 items-start'>
          <h5 className='font-semibold text-sm dark:text-gray-200'>{title}</h5>
          <span className='text-xs dark:text-gray-300'>{description}</span>
        </div>
      </button>
    </div>
  );
}

export default CheckBox;
