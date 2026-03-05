'use client';
import WebTrendLogo from '@/assets/logo.svg';
import { BACKEND_URL } from '@/utils/secrets';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LoginProvider from './LoginProvider';
import Input from '../ui/Input';
import Link from 'next/link';
import Button from '../ui/button';
import Checkbox from '../ui/Checkbox';
import { toast } from 'react-toastify';

function BrandLogin() {
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
        router.push('/brand/campaign'); // Redirect on success
      } else {
        if (result.error === 'unverified user') {
          toast.error(
            'Your email is not verified. Redirecting to verification page...'
          );
          router.push(
            `/auth/verify-email?for=brand&email=${encodeURIComponent(email)}`
          );
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
      <header className='flex flex-col md:flex-row items-center  gap-1 '>
        <WebTrendLogo className=' size-12 md:size-20 text-brand-primary' />
        <div className='flex items-center gap-1 md:gap-3 pt-1 md:pt-3'>
          <span className=' text-brand-primary font-bold text-lg md:text-2xl '>
            WebTrend
          </span>
          <h2 className='pl-2 md:pl-2 border-l border-l-black font-bold text-md md:text-xl'>
            For Brands
          </h2>
        </div>
      </header>
      <div className=' space-y-4 w-[95%] lg:w-[75%] mx-auto mt-2 md:mt-9 lg:mt-16 '>
        <h1 className='font-bold text-2xl text-center tracking-wider hidden md:block'>
          Connectez-vous à votre compte
        </h1>
        <div className='flex flex-col md:flex-row gap-1 md:gap-2 w-full'>
          <LoginProvider className=' flex-1 ' provider='google' />
          <LoginProvider className=' flex-1 ' provider='facebook' />
        </div>
        <form className='flex flex-col gap-4 rounded-lg shadow-lg p-2 md:p-3 lg:p-5 border'>
          <Input
            id='brand-email'
            label='Adresse e-mail'
            name='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isDisabled={isLoading}
          />
          <Input
            id='brand-pwd'
            label='Mot de passe'
            name='password'
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isDisabled={isLoading}
          />
          <div className='flex justify-between items-center'>
            <Checkbox
              id='show-password'
              label='Afficher le mot de passe'
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <Link
              href={`/auth/forgot-password?for=brand${
                email && `&email=${email}`
              } `}
              className='text-brand-secondary text-[12px] md:text-[14px]'
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Button
            className='bg-brand-primary !text-sm text-white uppercase'
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <div className='w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin'></div>
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>
        <p className='text-center text-sm mt-1 md:mt-2'>
          Vous n'avez pas de compte ?{' '}
          <Link href='/auth/signup' className='text-brand-secondary'>
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}

export default BrandLogin;
