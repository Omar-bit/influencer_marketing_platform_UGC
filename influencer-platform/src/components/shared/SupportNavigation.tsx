'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LuMessageCircleWarning } from 'react-icons/lu';

export default function SupportNavigation() {
  const { data } = useSession();
  const path = usePathname();
  //@ts-ignore
  const userType = data?.user?.type;

  // If the user is an admin, they should use the admin tickets page
  if (userType === 'admin') {
    const isActive =
      path === '/admin/tickets' || path.startsWith('/admin/tickets/');

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
          href='/admin/tickets'
        >
          Support Tickets
        </Link>
      </div>
    );
  }

  // For regular users (influencers, business)
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
