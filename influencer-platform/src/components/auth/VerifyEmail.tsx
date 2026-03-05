'use client';

import { useEffect, useState } from 'react';
import OTPInput from 'react-otp-input';
import WebTrendLogo from '@/assets/gradient-logo.svg';
import BackLink from '../ui/BackLink';
import Link from 'next/link';
import Button from '../ui/button';
import axios from 'axios';
import {
  resendActivationOtpCode,
  verifyEmail,
} from '@/utils/api/handlers/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

function VerifyEmail({
  userType = 'influencer',
  email,
}: {
  userType: 'influencer' | 'brand';
  email: string;
}) {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && resendDisabled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, resendDisabled]);

  async function handleResendOtp() {
    if (isLoading || resendDisabled) return;

    setIsLoading(true);
    try {
      await resendActivationOtpCode(email);
      setResendDisabled(true);
      setCountdown(60); // 60 seconds cooldown
      toast.success('Code sent successfully');
    } catch (error) {
      toast.error('Failed to resend code. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (verifyingEmail || !otp || otp.length !== 6) return;

    setVerifyingEmail(true);
    try {
      await verifyEmail(email, otp);
      toast.success('Email verified successfully!');
      router.push(`/auth/login?for=${userType}`);
    } catch (error) {
      toast.error('Invalid verification code. Please try again.');
      console.error(error);
      setVerifyingEmail(false);
    }
  }

  return (
    <div className='flex flex-col px-5 gap-5 md:gap-8 w-full'>
      <header className='flex justify-between items-center w-full'>
        <BackLink to={`/auth/signup?for=${userType}`} userType={userType} />
        <Link
          href={`/auth/login?for=${userType}`}
          className={
            userType === 'influencer'
              ? 'text-influencer-primary'
              : 'text-brand-primary'
          }
        >
          Sign in
        </Link>
      </header>
      <main className='flex flex-col gap-10'>
        <div className='flex flex-col gap-5 w-full'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-bold'>
            Verify your email
          </h2>
          <p className='text-gray-600'>
            We've sent a verification code to {email}. Please enter it below.
          </p>
          <OTPInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            renderSeparator={<span className='w-2'></span>}
            renderInput={(props) => (
              <input
                {...props}
                className='border rounded-md h-12 w-12 text-center text-lg font-medium shadow-md'
                disabled={verifyingEmail}
              />
            )}
            inputStyle={{
              width: '3rem',
              height: '3rem',
              margin: '0 0.5rem',
              fontSize: '1.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
            containerStyle='flex justify-center mt-8 mb-4'
          />

          <div className='text-center mt-4'>
            <p className='text-gray-500 text-sm mb-1'>
              Didn't receive a code?{' '}
              {resendDisabled ? (
                <span className='text-gray-400'>
                  Resend in {countdown} seconds
                </span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={isLoading || resendDisabled}
                  className={`${
                    userType === 'influencer'
                      ? 'text-influencer-primary'
                      : 'text-brand-primary'
                  } ${
                    isLoading || resendDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'underline font-medium cursor-pointer'
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Resend Code'}
                </button>
              )}
            </p>
          </div>
        </div>
      </main>
      <footer className='mt-5'>
        <Button
          className={`${
            userType === 'influencer'
              ? 'influencer-primary-gradient'
              : 'bg-brand-primary'
          } text-white w-full py-3 rounded-lg shadow-md`}
          onClick={handleVerifyOtp}
          disabled={otp.length !== 6 || verifyingEmail}
        >
          {verifyingEmail ? (
            <div className='flex items-center justify-center'>
              <div className='w-5 h-5 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin'></div>
              Verifying...
            </div>
          ) : (
            'Verify'
          )}
        </Button>
      </footer>
    </div>
  );
}

export default VerifyEmail;
