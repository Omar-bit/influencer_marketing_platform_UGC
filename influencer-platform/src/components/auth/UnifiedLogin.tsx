'use client';
// import WebTrendLogo from '@/assets/logo.svg';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LoginProvider from './LoginProvider';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import Button from '@/components/ui/button';
import Checkbox from '@/components/ui/Checkbox';
import { toast } from 'react-toastify';
import WebTrendLogo from '@/assets/gradient-logo.svg';

function UnifiedLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (!result?.error) {
        toast.success('Login successful! Redirecting...');
        // The middleware will handle the redirect based on user type
        console.log('Login successful:', result);

        window.location.href = '/dashboard';
      } else {
        console.error('Login error:', result);
        if (result.error === 'unverified user') {
          toast.error(
            'Your email is not verified. Redirecting to verification page...'
          );
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('An error occurred during login');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full h-full pb-2'>
      <header className='flex flex-col items-center gap-2'>
        <WebTrendLogo className='md:-mt-7 size-16 md:size-24 lg:size-32  dark:text-gray-300' />
        <div className='text-center -mt-5'>
          <h2 className='text-gray-700 dark:text-gray-300 font-extrabold text-xl md:text-3xl lg:text-4xl'>
            WebTrend
          </h2>
          <h3 className='font-bold text-sm md:text-lg text-gray-600 dark:text-gray-400 '>
            Influencer Marketing Platform
          </h3>
        </div>
      </header>

      <div className='space-y-4 w-[98%] lg:w-[75%] mx-auto mt-4 lg:mt-5'>
        <h1 className='font-bold text-xl md:text-2xl text-center tracking-wider text-gray-800 dark:text-gray-200 influencer-primary-gradient-text  w-full'>
          Welcome Back
        </h1>

        <div className='flex flex-col md:flex-row gap-2 w-full'>
          <LoginProvider className='flex-1' provider='google' />
          <LoginProvider className='flex-1' provider='facebook' />
        </div>

        <div className='flex items-center gap-2 mx-auto w-[80%]'>
          <div className='flex-1 h-px bg-gray-300 dark:bg-gray-600'></div>
          <span className='text-gray-500 dark:text-gray-400 font-medium'>
            Or
          </span>
          <div className='flex-1 h-px bg-gray-300 dark:bg-gray-600'></div>
        </div>

        <form className='flex flex-col gap-4 rounded-lg shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <Input
            id='email'
            label='Email Address'
            name='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isDisabled={isLoading}
            className={{
              input:
                'rounded-lg border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500',
            }}
          />
          <Input
            id='password'
            label='Password'
            name='password'
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isDisabled={isLoading}
            className={{
              input:
                'rounded-lg border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500',
            }}
          />
          <div className='flex justify-between items-center'>
            <Checkbox
              id='show-password'
              label='Show password'
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <Link
              href={`/auth/forgot-password${email && `?email=${email}`}`}
              className='text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm'
            >
              Forgot password?
            </Link>
          </div>
          <Button
            // className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200'
            color='gradient'
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <div className='w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin'></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
          Don't have an account?{' '}
          <Link
            href='/auth/signup'
            className='text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium'
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default UnifiedLogin;
