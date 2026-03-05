'use client';

import { useEffect, useState } from 'react';
import Button from '../ui/button';
import BackLink from '../ui/BackLink';
import Link from 'next/link';
import Input from '../ui/Input';
import OtpInput from 'react-otp-input';
import { validateEmail } from '@/utils/email';
import { verifyPassword } from '@/utils/password';
import {
  resendOtp,
  resetPassword,
  resetPasswordRequest,
  verifyOtp,
} from '@/utils/api/handlers/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ForgotPassword({
  userType = 'influencer',
  email = '',
}: {
  userType: 'influencer' | 'brand';
  email?: string;
}) {
  const router = useRouter();
  const [recoverEmail, setRecoverEmail] = useState(email ?? '');
  const [otp, setOtp] = useState('');
  const [isValidOtp, setIsValidOtp] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(() => (email ? 1 : 0));
  const [isLoading, setIsLoading] = useState(false);

  const isNextDisabled =
    (step === 0 && !validateEmail(recoverEmail)) ||
    (step === 1 && !isValidOtp) ||
    (step === 2 && !password) ||
    (step === 2 && password !== confirmPassword) ||
    isLoading;

  const steps = [
    <RetreiveEmail
      email={recoverEmail}
      setEmail={setRecoverEmail}
      isLoading={isLoading}
    />,
    <VerifyCode
      email={recoverEmail}
      otp={otp}
      setOtp={setOtp}
      isValidOtp={isValidOtp}
      setIsValidOtp={setIsValidOtp}
      userType={userType}
      handleNext={handleNext}
      isLoading={isLoading}
    />,
    <ResetPassword
      password={password}
      setPassword={setPassword}
      setConfirmPassword={setConfirmPassword}
      confirmPassword={confirmPassword}
      isLoading={isLoading}
    />,
  ];

  function handleNext() {
    if (isLoading) return;

    setIsLoading(true);
    if (step === 0) {
      if (validateEmail(recoverEmail)) {
        resetPasswordRequest(recoverEmail)
          .then(() => {
            toast.success('Code de vérification envoyé à votre email');
            setStep(step + 1);
          })
          .catch((error) => {
            toast.error("Erreur lors de l'envoi du code. Veuillez réessayer.");
            console.error(error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    } else if (step === 1) {
      if (isValidOtp) {
        setStep(step + 1);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }

  async function handleResetPassword() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await resetPassword(recoverEmail, otp, password);
      toast.success('Mot de passe réinitialisé avec succès!');
      router.push('/auth/login');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className='w-full h-full flex flex-col items-center gap-5 md:gap-10'>
      <header className='w-full flex justify-between items-center'>
        <BackLink to='/' userType={userType} />
        <Link
          className={`${
            userType === 'influencer'
              ? 'influencer-primary-gradient-text'
              : 'text-brand-secondary'
          }`}
          href='/auth/login'
        >
          Sign in
        </Link>
      </header>
      <main className='space-y-1 md:space-y-3 mt-5 md:mt-10'>
        {step != 2 && (
          <h2 className='font-extrabold text-3xl tracking-wider'>
            Forgot your Password ?
          </h2>
        )}
        {steps[step]}
      </main>
      <footer className=' w-[60%] flex items-center gap-3 justify-between  mt-auto '>
        <Button
          className={`${
            userType === 'influencer'
              ? 'influencer-primary-gradient-text'
              : 'text-brand-primary'
          }
          !px-10  border`}
          onClick={() => setStep(step - 1)}
          disabled={step === 0 || isLoading}
        >
          Back
        </Button>
        <Button
          className={`${
            userType === 'influencer'
              ? 'influencer-primary-gradient'
              : 'bg-brand-primary'
          } !px-24 text-white py-2`}
          onClick={step !== 2 ? handleNext : handleResetPassword}
          disabled={isNextDisabled}
        >
          {isLoading ? (
            <div className='flex items-center justify-center'>
              <div className='w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin'></div>
              {step !== 2 ? 'Processing...' : 'Confirming...'}
            </div>
          ) : step !== 2 ? (
            'Next'
          ) : (
            'Confirm'
          )}
        </Button>
      </footer>
    </section>
  );
}

function RetreiveEmail({
  email,
  setEmail,
  isLoading,
}: {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className='w-full flex flex-col  gap-1 md:gap-2'>
      <h1 className='font-extrabold text-2xl'>Saisi votre email</h1>
      <p className='text-[#707070]'>
        entrer votre adress email de votre compte!
      </p>
      <Input
        key='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Email'
        type='email'
        required
        isDisabled={isLoading}
      />
    </div>
  );
}

function VerifyCode({
  email,
  otp,
  setOtp,
  userType = 'influencer',
  isValidOtp,
  setIsValidOtp,
  handleNext,
  isLoading,
}: {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  userType?: 'influencer' | 'brand';
  setIsValidOtp: (val: boolean) => void;
  isValidOtp: boolean;
  handleNext: () => void;
  isLoading: boolean;
}) {
  const [resendLoading, setResendLoading] = useState(false);

  async function hanleVerifyOtp() {
    try {
      await verifyOtp(email, otp);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async function handleResendOtp() {
    if (resendLoading) return;

    setResendLoading(true);
    try {
      await resendOtp(email);
      toast.success('Code de vérification renvoyé');
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'envoi du code");
    } finally {
      setResendLoading(false);
    }
  }

  useEffect(() => {
    if (!email) return;

    resetPasswordRequest(email).catch((error) => {
      console.error('Error requesting password reset:', error);
    });
  }, [email]);

  useEffect(() => {
    async function verify() {
      const isValid = await hanleVerifyOtp();
      setIsValidOtp(isValid);
    }

    if (otp.length === 6) {
      verify();
    } else {
      setIsValidOtp(false);
    }
  }, [otp]);

  useEffect(() => {
    if (isValidOtp) {
      handleNext();
    }
  }, [isValidOtp]);

  return (
    <div className='w-full flex flex-col gap-1 md:gap-2'>
      <p className='text-[#707070]'>
        Enter the code you received to renew your password. <br />
        <span
          className={`cursor-pointer ${
            userType === 'influencer'
              ? 'influencer-primary-gradient-text'
              : 'text-brand-secondary'
          } ${
            isLoading || resendLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => !isLoading && !resendLoading && handleResendOtp()}
        >
          {resendLoading ? 'Sending code...' : 'I have not received a code.'}
        </span>
      </p>

      <OtpInput
        value={otp}
        onChange={setOtp}
        numInputs={6}
        renderSeparator={false}
        renderInput={(props) => <input {...props} disabled={isLoading} />}
        inputStyle='!size-10 md:!size-14 ! rounded-lg shadow-md border'
        containerStyle='flex justify-center gap-2 items-center mt-3'
      />
      {otp.length === 6 && !isValidOtp && (
        <p className='text-red-600 mt-3 text-sm'>Invalid code!</p>
      )}
    </div>
  );
}

function ResetPassword({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isLoading,
}: {
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPass: string) => void;
  isLoading: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (password) {
      const passwordState = verifyPassword(password);
      if (!passwordState.valid) {
        setError(passwordState.error);
      } else {
        setError(null);
      }
    } else {
      setError(null);
    }
  }, [password]);

  return (
    <div className='space-y-1 md:space-y-3'>
      <h1 className='font-bold text-lg md:text-2xl'>New Password</h1>
      <p className='text-[#707070]'>
        A strong password helps prevent unauthorized access to your WebTrend
        account
      </p>
      <Input
        placeholder='New Password'
        type='password'
        label='Password...'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        info='Password must have at least 8 characters, one uppercase letter, one lowercase letter, and one digit'
        error={error}
        isDisabled={isLoading}
      />
      <Input
        placeholder='Confirm Password'
        label='Confirm Password...'
        type='password'
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        error={
          password !== confirmPassword && confirmPassword
            ? 'Confirm Password should match Password'
            : null
        }
        isDisabled={isLoading}
      />
    </div>
  );
}
