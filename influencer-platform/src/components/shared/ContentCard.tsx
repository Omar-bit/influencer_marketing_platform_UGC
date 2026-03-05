import React, { ReactNode } from 'react';

type ContentCardProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  user?: 'neutral' | 'brand' | 'influencer';
  headerVariant?: 'default' | 'separated';
};

export function ContentSection({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-2'>
          {title}
        </h3>
      )}
      <div className='w-full break-words'>{children}</div>
    </div>
  );
}

export function InfoItem({
  label,
  value,
  valueClassName = 'text-gray-900 dark:text-gray-100',
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className='grid grid-cols-2 mb-3'>
      <span className='text-gray-500 dark:text-gray-400 text-sm'>{label}</span>
      <span className={`text-sm ${valueClassName}`}>{value}</span>
    </div>
  );
}

export function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className='list-disc pl-5 space-y-1'>
      {items.map((item, index) => (
        <li key={index} className='text-sm text-gray-800 dark:text-gray-200'>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ContentCard({
  title,
  icon,
  children,
  className = '',
  headerVariant = 'default',
  user = 'neutral',
}: ContentCardProps) {
  const bg =
    user === 'influencer'
      ? 'bg-[#fff5fa] dark:bg-gray-800'
      : 'dark:bg-gray-800';
  const border =
    user === 'influencer'
      ? 'border-[#FFB7DB] dark:border-gray-700'
      : 'border-gray-200 dark:border-gray-700';

  return (
    <div
      className={`w-full border shadow rounded-lg overflow-hidden ${border} ${bg} ${className}`}
    >
      {title && (
        <header
          className={`flex items-center px-4 py-3 rounded-t-lg ${
            headerVariant === 'separated'
              ? 'bg-[#F9FAFB] dark:bg-gray-900 border-b border-[#D4D4D4] dark:border-gray-700'
              : ''
          }`}
        >
          {icon && <span className='mr-2'>{icon}</span>}
          <h2 className='font-semibold dark:text-gray-200'>{title}</h2>
        </header>
      )}

      <div className='w-full px-4 py-3 space-y-4'>{children}</div>
    </div>
  );
}

export default ContentCard;
