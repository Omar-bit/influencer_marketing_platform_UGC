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
import { BACKEND_URL } from '@/utils/secrets';
import BackLink from '../ui/BackLink';
import Seperator from '../ui/Seperator';
import { Container } from 'postcss';
import DropDown from '../ui/DropDown';
import { verifyPassword } from '@/utils/password';
import { validateEmail } from '@/utils/email';
import {
  isEmail,
  isStrongPassword,
  isValidPhone,
  minLength,
  required,
  useFormValidation,
} from '@/hooks/useFormValidation';
import { toast } from 'react-toastify';

function InfluencerSignup() {
  const [name, setName] = useState('');
  const [town, setTown] = useState('');
  const [country, setCountry] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { errors, validateField } = useFormValidation({
    name: [required, minLength(2)],
    lastName: [required, minLength(2)],
    email: [required, isEmail],
    password: [required, isStrongPassword],
    birthDate: [required],
    phone: [required, isValidPhone],
    country: [required],
    town: [required],
  });

  const disabled =
    !name ||
    !lastName ||
    !!errors.email ||
    !!errors.password ||
    !birthDate ||
    !!errors.phone ||
    !country ||
    !town ||
    !termsAccepted ||
    isLoading;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (disabled) return;

    setIsLoading(true);
    const data = {
      email,
      password,
      type: 'influencer',
      name: `${name} ${lastName}`,
      date: birthDate,
      phone,
      country,
      city: town,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Compte créé avec succès! Vérifiez votre email.');
        router.push('/auth/verify-email?' + 'for=influencer&email=' + email);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Erreur lors de l'inscription");
      }
    } catch (e: any) {
      toast.error("Erreur lors de l'inscription: " + e.message);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full h-full pb-2'>
      <header className='flex flex-col   gap-0 md:gap-1 '>
        <WebTrendLogo className=' size-16 md:size-20 lg:size-32 p-0 m-0 ' />
        <div className='flex items-center gap-x-1 -mt-7'>
          <h2 className=' text-brand-primary font-extrabold text-md md:text-xl lg:text-2xl  '>
            WebTrend
          </h2>
          <h3 className=' font-bold text-md md:text-lg text-influencer-primary'>
            For Influencers
          </h3>
        </div>
        <nav className='w-full flex justify-between items-center px-2 md:px-3 lg:px-5 mt-2'>
          <BackLink to='/auth/login' userType='influencer' />
          <p>
            Already have an account.
            <Link href='/auth/login' className='text-influencer-secondary'>
              Sign in
            </Link>
          </p>
        </nav>
      </header>
      <div className=' space-y-4 w-[98%] lg:w-[75%] mx-auto mt-2 lg:mt-5 !bg-transparent'>
        <h1 className='font-bold text-xl md:text-3xl text-center tracking-wider hidden md:block'>
          <span className='influencer-primary-gradient-text mr-1'>
            Let’s get you
          </span>
          started
        </h1>
        <div className='flex flex-col md:flex-row gap-1 md:gap-2 w-full mt-5'>
          <LoginProvider className=' flex-1 ' provider='google' type='signup' />
          <LoginProvider
            className=' flex-1 '
            provider='facebook'
            type='signup'
          />
        </div>
        <div className='flex items-center gap-2 mx-auto w-[80%] '>
          <Seperator />
          <span className='influencer-primary-gradient-text'>Or</span>
          <Seperator />
        </div>
        <form className='flex flex-wrap gap-1 rounded-lg  p-2 md:p-3'>
          <Input
            id='influencer-name'
            label='First name'
            name='name'
            type='text'
            value={name}
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            onBlur={(e) => validateField('name', e.target.value)}
            isDisabled={isLoading}
          />
          <Input
            id='influencer-lastName'
            label='Last name'
            name='last-name'
            type='text'
            value={lastName}
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            onChange={(e) => setLastName(e.target.value)}
            error={errors.lastName}
            onBlur={(e) => validateField('lastName', e.target.value)}
            isDisabled={isLoading}
          />

          <Input
            id='influencer-bd'
            label='Date of Birth'
            name='bd'
            type='date'
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            error={errors.birthDate}
            onBlur={(e) => validateField('birthDate', e.target.value)}
            isDisabled={isLoading}
          />
          <Input
            id='influencer-ph'
            label='Phone number'
            name='phone'
            type='tel'
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            onBlur={(e) => validateField('phone', e.target.value)}
            isDisabled={isLoading}
          />
          <Input
            id='influencer-email'
            label='Adresse e-mail'
            name='email'
            type='email'
            value={email}
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            onBlur={(e) => validateField('email', e.target.value)}
            isDisabled={isLoading}
          />
          <Input
            id='influencer-pwd'
            label='Mot de passe'
            name='password'
            type='password'
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            onBlur={(e) => validateField('password', e.target.value)}
            isDisabled={isLoading}
          />
          <Input
            id='influencer-country'
            label='Country'
            name='country'
            type='text'
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            error={errors.country}
            onBlur={(e) => validateField('country', e.target.value)}
            isDisabled={isLoading}
          />
          <Input
            id='influencer-town'
            label='Town'
            name='town'
            type='text'
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            value={town}
            onChange={(e) => setTown(e.target.value)}
            error={errors.town}
            onBlur={(e) => validateField('town', e.target.value)}
            isDisabled={isLoading}
          />
          <div className='flex gap-2 items-center'>
            <p className='text-[12px] md:text-[14px]'>
              I acknowledge that i have read and agree with the{' '}
              <Link href='/use-terms' className='text-influencer-secondary'>
                Terms of use
              </Link>
            </p>
            <Checkbox
              checked={termsAccepted}
              onChange={setTermsAccepted}
              label=''
              id='influencer-terms'
            />
          </div>
          <footer className='flex w-full justify-end mt-2'>
            <Button
              disabled={disabled}
              className='influencer-primary-gradient px-10 tracking-wider text-white '
              onClick={handleSubmit}
            >
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin'></div>
                  Loading...
                </div>
              ) : (
                'Next'
              )}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default InfluencerSignup;
