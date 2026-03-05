'use client';

import { signinWithProvider } from '@/utils/auth';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import Button from '../ui/button';
import { capitalize } from '@/utils/string';
import { useState } from 'react';

function LoginProvider({
  provider,
  className,
  type = 'signin',
}: {
  provider: 'google' | 'facebook';
  className?: string;
  type?: 'signin' | 'signup';
}) {
  const [isLoading, setIsLoading] = useState(false);
  const label = type === 'signin' ? 'Sign in with ' : 'Sign up with ';
  const labelWithProvider = label + capitalize(provider);
  const icon =
    provider === 'google' ? (
      <FcGoogle className='size-5' />
    ) : (
      <FaFacebook className='text-[#3b5998] size-5' />
    );

  const handleProviderAuth = () => {
    setIsLoading(true);
    // to reset loading state in case the redirect fails
    setTimeout(() => setIsLoading(false), 1000);
    signinWithProvider(provider);
  };

  return (
    <Button
      className={`flex !font-normal items-center justify-center gap-2 border rounded-lg shadow-lg p-3 text-[10px] bg-white !text-black ${className}`}
      onClick={handleProviderAuth}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className='flex items-center justify-center'>
          <div className='w-4 h-4 mr-2 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin'></div>
          {`Connecting to ${capitalize(provider)}...`}
        </div>
      ) : (
        <>
          {icon}
          {labelWithProvider}
        </>
      )}
    </Button>
  );
}

export default LoginProvider;
