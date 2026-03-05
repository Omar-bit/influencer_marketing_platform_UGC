'use client';
import WebTrendLogo from '@/assets/logo.svg';
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
import {
  isEmail,
  isStrongPassword,
  isValidPhone,
  minLength,
  required,
  useFormValidation,
} from '@/hooks/useFormValidation';
import { toast } from 'react-toastify';

function BrandSignup() {
  const [name, setName] = useState('');
  const [town, setTown] = useState('');
  const [country, setCountry] = useState('');
  const [lastName, setLastName] = useState('');

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
      type: 'business',
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
        router.push('/auth/verify-email?' + 'for=brand&email=' + email);
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
      <header className='flex flex-col gap-1 '>
        <div className='flex'>
          <WebTrendLogo className=' size-12 md:size-20 text-brand-primary' />
          <div className='flex items-center gap-1 md:gap-3 pt-1 md:pt-3'>
            <span className=' text-brand-primary font-bold text-lg md:text-2xl '>
              WebTrend
            </span>
            <h2 className='pl-2 md:pl-2 border-l border-l-black font-bold text-md md:text-xl'>
              For Brands
            </h2>
          </div>
        </div>
        <nav className='w-full flex justify-between items-center px-2 md:px-3 lg:px-5 mt-2'>
          <BackLink to='/auth/login' userType='brand' />
          <p>
            Already have an account.
            <Link href='/auth/login' className='text-brand-primary'>
              Sign in
            </Link>
          </p>
        </nav>
      </header>
      <div className=' space-y-4 w-[98%] lg:w-[75%] mx-auto mt-2 lg:mt-5 !bg-transparent'>
        <h1 className='font-bold text-xl md:text-3xl text-center tracking-wider hidden md:block'>
          <span className='text-brand-primary mr-1'>Let’s get you</span>
          started
        </h1>
        <div className='flex flex-col md:flex-row gap-1 md:gap-2 w-full mt-5'>
          {/* <LoginProvider className=' flex-1 ' provider='google' type='signup' />
          <LoginProvider
            className=' flex-1 '
            provider='facebook'
            type='signup'
          /> */}
        </div>
        <div className='flex items-center gap-2 mx-auto w-[80%] '>
          <Seperator type='brand' />
          <span className='text-brand-primary font-bold'>Or</span>
          <Seperator type='brand' />
        </div>
        <form className='flex flex-wrap gap-1 rounded-lg  p-2 md:p-3   '>
          <Input
            id='name'
            label='First name'
            name='name'
            type='text'
            value={name}
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => validateField('name', name)}
            error={errors.name}
            isDisabled={isLoading}
          />
          <Input
            id='lastName'
            label='Last name'
            name='last-name'
            type='text'
            value={lastName}
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => validateField('lastName', lastName)}
            error={errors.lastName}
            isDisabled={isLoading}
          />

          <Input
            id='bd'
            label='Date of Birth'
            name='bd'
            type='date'
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            onBlur={() => validateField('birthDate', birthDate)}
            error={errors.birthDate}
            isDisabled={isLoading}
          />
          <Input
            id='ph'
            label='Phone number'
            name='phone'
            type='tel'
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => validateField('phone', phone)}
            error={errors.phone}
            isDisabled={isLoading}
          />
          <Input
            id='email'
            label='Adresse e-mail'
            name='email'
            type='email'
            value={email}
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => validateField('email', email)}
            error={errors.email}
            isDisabled={isLoading}
          />
          <Input
            id='pwd'
            label='Mot de passe'
            name='password'
            type='password'
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => validateField('password', password)}
            error={errors.password}
            isDisabled={isLoading}
          />
          <Input
            id='country'
            label='Country'
            name='country'
            type='text'
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            onBlur={() => validateField('country', country)}
            error={errors.country}
            isDisabled={isLoading}
          />
          <Input
            id='town'
            label='Town'
            name='town'
            type='text'
            className={{
              container: 'w-full md:w-full  lg:w-[48%]',
              input: 'rounded-2xl border  drop-shadow-2xl',
            }}
            value={town}
            onChange={(e) => setTown(e.target.value)}
            onBlur={() => validateField('town', town)}
            error={errors.town}
            isDisabled={isLoading}
          />
          <div className='flex gap-2 items-center'>
            <p className='text-[12px] md:text-[14px]'>
              I acknowledge that i have read and agree with the{' '}
              <Link href='/use-terms' className='text-brand-secondary'>
                Terms of use
              </Link>
            </p>
            <Checkbox
              checked={termsAccepted}
              onChange={setTermsAccepted}
              label=''
              id='terms'
            />
          </div>
          <footer className='flex w-full justify-end mt-2'>
            <Button
              className='bg-brand-primary px-10 tracking-wider text-white '
              onClick={handleSubmit}
              disabled={disabled}
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

export default BrandSignup;
