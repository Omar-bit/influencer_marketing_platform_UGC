'use client';
import { userTypes } from '@/types/users';
import { useTheme } from '@/providers/themeContext';

type BannerProps = {
  children: React.ReactNode;
  variant?: userTypes;
  isGradient?: boolean;
  className?: string;
};
export default function Banner({
  children,
  variant = 'brand',
  className = '',
  isGradient = true,
}: BannerProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const finalGradient = isGradient ? 'gradient' : 'base';
  const classNames: any = {
    brand: {
      base: 'bg-brand-primary text-white dark:bg-brand-dark-primary dark:text-gray-200',
      gradient: `brand-gradient text-black ${
        isDarkMode && 'brand-dark-gradient'
      } dark:text-gray-100`,
    },
    influencer: {
      base: 'bg-influencer-primary text-white dark:bg-influencer-dark-primary dark:text-gray-200',
      gradient:
        'text-white influencer-primary-gradient-opacity dark:influencer-dark-gradient-opacity',
    },
  };
  return (
    <div
      className={`space-y-2 text-center p-2 rounded-lg shadow dark:text-white ${classNames[variant][finalGradient]} ${className}`}
    >
      {children}
    </div>
  );
}
