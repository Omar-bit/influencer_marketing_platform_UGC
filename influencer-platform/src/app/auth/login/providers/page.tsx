'use client';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api_ssr } from '@/utils/axiosInstance';

export default function LoginWithProvidersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { data: auth } = useSession();

  async function verifyProviders() {
    try {
      const { data: res } = await api_ssr.get('/auth/providers', {
        withCredentials: true,
      });
      if (res.data) {
        const isSignsin = await signIn('providers', {
          email: res.data.user.email,
          passKey: res.data.passKey,
          redirect: false,
        });
        if (isSignsin?.status === 200) {
          router.push('/auth/login');
        }
      } else {
        throw new Error('Error during verification:');
      }
    } catch (e: any) {
      console.log('data from custom provider:', e);
      setError(e.response?.data?.message || e.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    verifyProviders();
  }, [router]);

  if (isLoading) {
    return <div className='p-4'>Loading authentication status...</div>;
  }

  return (
    <div className='p-4'>
      {isLoading ? (
        <div className='text-center'>Loading...</div>
      ) : auth?.user ? (
        <div className='text-center'>
          You are already logged in as {auth.user.email}. Redirecting...
        </div>
      ) : error ? (
        <div className='text-red-500 text-center'>{error}</div>
      ) : null}
    </div>
  );
}
