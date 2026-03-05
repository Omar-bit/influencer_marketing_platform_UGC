'use client';
import WebTrendLogo from '@/assets/gradient-logo.svg';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LoginProvider from './LoginProvider';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import Button from '@/components/ui/button';
import Checkbox from '@/components/ui/Checkbox';
import { toast } from 'react-toastify';

function InfluencerLogin() {
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
        toast.success('Connexion réussie! Redirection...');
        router.push('/influencer'); // Redirect on success
      } else {
        console.error('Login error:', result);
        if (result.error === 'unverified user') {
          toast.error(
            "Votre email n'est pas vérifié. Redirection vers la page de vérification..."
          );
          router.push(
            `/auth/verify-email?for=influencer&email=${encodeURIComponent(
              email
            )}`
          );
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la connexion');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full h-full pb-2'>
      <header className='flex flex-col items-center  gap-0 md:gap-1 '>
        <WebTrendLogo className=' size-20 md:size-32 lg:size-40 p-0 m-0 ' />
        <h2 className=' text-brand-primary font-extrabold text-lg md:text-2xl lg:text-5xl -mt-5 lg:-mt-10 '>
          WebTrend
        </h2>
        <h3 className=' font-bold text-md md:text-xl text-influencer-primary'>
          For Influencers
        </h3>
      </header>
      <div className=' space-y-4 w-[98%] lg:w-[75%] mx-auto mt-2 lg:mt-5 '>
        <h1 className='font-bold text-2xl text-center tracking-wider hidden md:block'>
          Connectez-vous à votre compte
        </h1>
        <div className='flex flex-col md:flex-row gap-1 md:gap-2 w-full '>
          <LoginProvider className=' flex-1 ' provider='google' />
          <LoginProvider className=' flex-1 ' provider='facebook' />
        </div>
        <form className='flex flex-col gap-4 rounded-lg shadow-lg p-2 md:p-3 lg:p-5 border'>
          <Input
            id='influencer-email'
            label='Adresse e-mail'
            name='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isDisabled={isLoading}
          />
          <Input
            id='influencer-pwd'
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
              href={`/auth/forgot-password?for=influencer${
                email && `&email=${email}`
              } `}
              className='text-influencer-primary text-[12px] md:text-[14px]'
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Button
            className='influencer-primary-gradient !text-sm text-white uppercase'
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
          <Link href='/auth/signup' className='text-influencer-primary'>
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}

export default InfluencerLogin;
