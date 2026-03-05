'use client';
import { useTheme } from '@/providers/themeContext';
import { FiMoon, FiSun } from 'react-icons/fi';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className='p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <FiMoon className='size-5' />
      ) : (
        <FiSun className='size-5 text-yellow-300' />
      )}
    </button>
  );
}
