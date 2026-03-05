'use client';
import SuccessImg from '@/assets/success.png';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import Button from '@/components/ui/button';
import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/utils/api/handlers/user';
import { useSession } from 'next-auth/react';
import { getBrandRemainingCampaigns } from '@/utils/api/handlers/brand';

export default function PaymentContent() {
  const searchParams = useSearchParams();
  const { update, data: session, status: authState } = useSession();
  console.log('session', session);

  // Extract parameters from the URL
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const paymentRef = searchParams.get('paymentRef');
  const campaignId = searchParams.get('campaignId');
  const errorMessage = searchParams.get('error');
  console.log(type, paymentRef, campaignId, errorMessage);

  // Redirect to dashboard if essential parameters are missing
  //   if (!status || !type || !paymentRef) {
  //     redirect('/dashboard');
  //   }
  useEffect(() => {
    getBrandRemainingCampaigns()
      .then((data) => {
        //@ts-ignore
        if (
          //@ts-ignore
          session?.user?.type === 'business' &&
          //@ts-ignore
          data.data !== session?.user?.remainingCampaigns
        ) {
          update({
            ...session,
            user: {
              ...session.user,
              remainingCampaigns: data.data,
            },
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [authState]);

  return (
    <div className='container max-w-3xl mx-auto py-10 px-4'>
      <Card className='shadow-lg border-t-4 border-t-primary'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>
            {status === 'success' ? 'Payment Successful' : 'Payment Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'success'
              ? 'Your payment has been processed successfully'
              : 'There was an issue with your payment'}
          </CardDescription>
        </CardHeader>

        <CardContent className='flex flex-col items-center gap-6'>
          {status === 'success' ? (
            <>
              <div className='w-32 h-32 relative'>
                <Image
                  src={SuccessImg}
                  alt='Payment Success'
                  fill
                  className='object-contain'
                />
              </div>

              <Alert variant='success' className='bg-green-50 border-green-200'>
                {/* <CheckCircle2 className="h-5 w-5 text-green-600" /> */}
                <p>Icon</p>
                <AlertTitle className='text-green-800'>
                  Transaction Complete
                </AlertTitle>
                <AlertDescription className='text-green-700'>
                  Thank you! Your payment was processed successfully.
                </AlertDescription>
              </Alert>

              <div className='w-full border rounded-md p-4 bg-slate-50 space-y-2 dark:text-black'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>
                    Payment Reference:
                  </span>
                  <span className='font-medium'>{paymentRef}</span>
                </div>
                {campaignId && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Campaign ID:</span>
                    <span className='font-medium'>{campaignId}</span>
                  </div>
                )}
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Type:</span>
                  <span className='font-medium capitalize'>{type}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className='w-20 h-20 rounded-full bg-red-100 flex items-center justify-center'>
                {/* <AlertCircle className="h-10 w-10 text-red-500" /> */}
                <p>Icon</p>
              </div>

              <Alert variant='destructive'>
                {/* <AlertCircle className="h-4 w-4" /> */}
                <p>Icon</p>
                <AlertTitle>Payment Failed</AlertTitle>
                <AlertDescription>
                  {errorMessage ||
                    'There was a problem processing your payment. Please try again or contact support.'}
                </AlertDescription>
              </Alert>

              <div className='w-full border rounded-md p-4 bg-slate-50 space-y-2 dark:text-black'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>
                    Payment Reference:
                  </span>
                  <span className='font-medium'>{paymentRef}</span>
                </div>
                {campaignId && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Campaign ID:</span>
                    <span className='font-medium'>{campaignId}</span>
                  </div>
                )}
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Type:</span>
                  <span className='font-medium capitalize'>{type}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className='flex justify-center gap-4 pt-4'>
          <Button onClick={() => (window.location.href = '/brand')}>
            Return to Dashboard
          </Button>
          {status === 'failed' && (
            <Button variant='outlined' onClick={() => window.history.back()}>
              Try Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50 ${className}`}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'destructive' | 'success';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default:
      'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
    destructive:
      'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/30',
    success:
      'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/30',
  };

  return (
    <div
      ref={ref}
      role='alert'
      className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
});
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';
