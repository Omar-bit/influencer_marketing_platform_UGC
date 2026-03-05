'use client';
import { logout } from '@/utils/auth';

export default () => (
  <button
    onClick={() => logout()}
    className='px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-200 shadow-md w-full'
  >
    Logout
  </button>
);
