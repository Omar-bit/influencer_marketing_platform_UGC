import Button from '@/components/ui/button';
import Image from 'next/image';
import SuccessImg from '@/assets/success.png';
import Link from 'next/link';

export default function Cong() {
  return (
    <div className='w-full flex flex-col items-center gap-2 px-4 sm:px-0 text-center'>
      <h1 className='influencer-primary-gradient-text text-2xl sm:text-4xl font-bold'>
        Congratulations
      </h1>
      <h4 className='font-bold text-black text-lg sm:text-xl'>
        You've created your campaign successfully.
      </h4>
      <p className='text-[#808080] text-sm sm:text-base max-w-md'>
        Your campaign is under review now. Our team will approve your campaign
        in two to three working days.
      </p>
      <Image
        src={SuccessImg}
        width={400}
        className='w-[80%] sm:w-[40%] my-4'
        alt='success'
      />
      <Link href='/brand/campaign/'>
        <Button
          className='font-bold !px-8 sm:!px-10 w-full sm:w-auto'
          color='gradient'
        >
          MANAGE
        </Button>
      </Link>
    </div>
  );
}
