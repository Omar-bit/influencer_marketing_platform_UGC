'use client';

import React from 'react';
import { LuMessageCircleWarning } from 'react-icons/lu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SupportNavItem() {
  const path = usePathname();
  const isActive = path === '/support' || path.startsWith('/support/');

  return (
    <div
      className={`flex items-center gap-2 mb-2 py-2 pl-2 ${
        isActive
          ? 'bg-brand-primary_10 text-brand-primary border-l-8 border-l-brand-primary rounded-l-md dark:bg-gray-800'
          : ''
      }`}
    >
      <LuMessageCircleWarning
        className={isActive ? 'text-brand-primary' : ''}
      />
      <Link
        className='text-black dark:text-white font-semibold uppercase text-[14px]'
        href='/support'
      >
        Support
      </Link>
    </div>
  );
}
