import React from 'react';

type InfoCardItem = {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
};

type InfoCardProps = {
  title: string;
  icon: React.ReactNode;
  items: InfoCardItem[];
};

function InfoCard({ title, icon, items }: InfoCardProps) {
  return (
    <div className='rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
      <div className='flex items-center px-4 py-3 bg-white dark:bg-gray-800'>
        {icon}
        <h2 className='font-semibold dark:text-gray-200'>{title}</h2>
      </div>

      <div className='p-4 dark:bg-gray-800'>
        {items.map((item, index) => (
          <div
            key={index}
            className={`grid grid-cols-2 ${
              index < items.length - 1 ? 'mb-3' : ''
            }`}
          >
            <span className='text-gray-500 dark:text-gray-400 text-sm'>
              {item.label}
            </span>
            <span
              className={`text-sm ${
                item.valueClassName || 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InfoCard;
