import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  color?: SUPPORTED_COLORS;
  variant?: SUPPORTED_VARIANTS;
  user?: 'influencer' | 'brand';
};

export type SUPPORTED_COLORS =
  | 'primary'
  | 'secondary'
  | 'gradient'
  | 'default'
  | 'danger'
  | 'gray';

export type SUPPORTED_VARIANTS =
  | 'filled'
  | 'outlined'
  | 'light'
  | 'ghost'
  | 'dashed';

export default function Button({
  children,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  color = 'primary',
  variant = 'filled',
  user = 'influencer',
}: ButtonProps) {
  const baseColors = {
    influencer: {
      primary: {
        filled: 'bg-[var(--influencer-primary)] text-white',
        outlined:
          'border border-[var(--influencer-primary)] text-[var(--influencer-primary)] bg-transparent',
        light:
          'bg-[var(--influencer-primary)] bg-opacity-10 text-[var(--influencer-primary)]',
        ghost:
          'text-[var(--influencer-primary)] bg-transparent hover:bg-opacity-10',
        dashed:
          'border border-dashed border-[var(--influencer-primary)] text-[var(--influencer-primary)] bg-transparent',
      },
      secondary: {
        filled: 'bg-[var(--influencer-secondary)] text-black',
        outlined:
          'border border-[var(--influencer-secondary)] text-[var(--influencer-secondary)] bg-transparent',
        light:
          'bg-[var(--influencer-secondary)] bg-opacity-10 text-[var(--influencer-secondary)]',
        ghost:
          'text-[var(--influencer-secondary)] bg-transparent hover:bg-opacity-10',
        dashed:
          'border border-dashed border-[var(--influencer-secondary)] text-[var(--influencer-secondary)] bg-transparent',
      },
      gradient: {
        filled: 'influencer-primary-gradient text-white',
        outlined:
          'border border-influencer-primary influencer-primary-gradient-text text-white ',
        light: 'influencer-primary-gradient-text bg-opacity-10',
        ghost:
          'influencer-primary-gradient-text bg-transparent hover:bg-opacity-10',
        dashed:
          'border border-dashed border-transparent influencer-primary-gradient-text',
      },
      danger: {
        filled: 'bg-red-500 text-white',
        outlined: 'border border-red-500 text-red-500 bg-transparent',
        light: 'bg-red-500 bg-opacity-10 text-red-500',
        ghost: 'text-red-500 bg-transparent hover:bg-opacity-10',
        dashed:
          'border border-dashed border-red-500 text-red-500 bg-transparent',
      },
      default: {
        filled: 'bg-gray-200 text-black',
        outlined: 'border border-gray-300 text-gray-700 bg-transparent',
        light: 'bg-gray-100 text-gray-700',
        ghost: 'text-gray-700 bg-transparent hover:bg-gray-100',
        dashed:
          'border border-dashed border-gray-300 text-gray-700 bg-transparent',
      },
      gray: {
        filled: 'bg-gray-200 text-black',
        outlined: 'border border-gray-300 text-gray-700 bg-transparent',
        light: 'bg-gray-100 text-gray-700',
        ghost: 'text-gray-700 bg-transparent hover:bg-gray-100',
        dashed:
          'border border-dashed border-gray-300 text-gray-700 bg-transparent',
      },
    },
    brand: {
      primary: {
        filled: 'bg-[var(--brand-primary)] text-white',
        outlined:
          'border border-[var(--brand-primary)] text-[var(--brand-primary)] bg-transparent',
        light:
          'bg-[var(--brand-primary)] bg-opacity-10 text-[var(--brand-primary)]',
        ghost: 'text-[var(--brand-primary)] bg-transparent hover:bg-opacity-10',
        dashed:
          'border border-dashed border-[var(--brand-primary)] text-[var(--brand-primary)] bg-transparent',
      },
      secondary: {
        filled: 'bg-[var(--brand-secondary)] text-white',
        outlined:
          'border border-[var(--brand-secondary)] text-[var(--brand-secondary)] bg-transparent',
        light:
          'bg-[var(--brand-secondary)] bg-opacity-10 text-[var(--brand-secondary)]',
        ghost:
          'text-[var(--brand-secondary)] bg-transparent hover:bg-opacity-10',
        dashed:
          'border border-dashed border-[var(--brand-secondary)] text-[var(--brand-secondary)] bg-transparent',
      },
      gradient: {
        filled: 'bg-brand-primary text-white',
        outlined:
          'border-2 border-transparent bg-clip-border text-brand-primary',
        light: 'text-brand-primary bg-opacity-10',
        ghost: 'text-brand-primary bg-transparent hover:bg-opacity-10',
        dashed: 'border border-dashed border-transparent text-brand-primary',
      },
      danger: {
        filled: 'bg-red-500 text-white',
        outlined: 'border border-red-500 text-red-500 bg-transparent',
        light: 'bg-red-500 bg-opacity-10 text-red-500',
        ghost: 'text-red-500 bg-transparent hover:bg-opacity-10',
        dashed:
          'border border-dashed border-red-500 text-red-500 bg-transparent',
      },
      default: {
        filled: 'bg-gray-200 text-black',
        outlined: 'border border-gray-300 text-gray-700 bg-transparent',
        light: 'bg-gray-100 text-gray-700',
        ghost: 'text-gray-700 bg-transparent hover:bg-gray-100',
        dashed:
          'border border-dashed border-gray-300 text-gray-700 bg-transparent',
      },
      gray: {
        filled: 'bg-gray-200 text-black',
        outlined: 'border border-gray-300 text-gray-700 bg-transparent',
        light: 'bg-gray-100 text-gray-700',
        ghost: 'text-gray-700 bg-transparent hover:bg-gray-100',
        dashed:
          'border border-dashed border-gray-300 text-gray-700 bg-transparent',
      },
    },
  };

  const getColorClasses = () => {
    return baseColors[user][color][variant];
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-5 py-2 
        font-semibold 
        text-md 
        shadow-md 
        rounded-lg 
        transition-all 
        duration-300 
        ease-in-out

        
        ${getColorClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
