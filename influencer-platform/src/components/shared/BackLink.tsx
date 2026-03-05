import React from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';


interface BackLinkProps {
  to: string;
  userType: 'brand' | 'influencer';
  className?: string;
}

export default function BackLink({ to, userType, className = '' }: BackLinkProps) {
  return (
    <Link
      href={to}
      className={`inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white ${className}`}
    >
      <FaArrowLeft className="w-4 h-4 mr-1" />
      Back to {userType === 'brand' ? 'Products' : 'Campaigns'}
    </Link>
  );
} 