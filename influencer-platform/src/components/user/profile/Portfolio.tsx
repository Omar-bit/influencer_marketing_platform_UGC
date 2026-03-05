import { BACKEND_URL } from '@/utils/secrets';
import Image from 'next/image';
import Link from 'next/link';

type PortflioProps = { profile: any };

function Portfolio({ profile }: PortflioProps) {
  return (
    <>
      <div className='w-full sm:w-[80%] md:w-[65%] mx-auto px-4 mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center'>
            <svg
              className='w-5 h-5 text-pink-500 mr-2 flex-shrink-0'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
            <h2 className='font-semibold'>Portfolio</h2>
          </div>
          <Link
            href='#'
            className='text-sm text-pink-500 hover:text-pink-600 flex items-center'
          >
            Show All
            <svg
              className='w-4 h-4 ml-1'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                clipRule='evenodd'
              />
            </svg>
          </Link>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4'>
          {profile.portfolio &&
            profile.portfolio.length > 0 &&
            profile.portfolio.map((item: any, index: any) => (
              <div
                key={index}
                className=' rounded border border-gray-200 overflow-hidden'
              >
                <Image
                  src={`${BACKEND_URL}/uploads/${item}`}
                  alt={`Portfolio item ${index + 1}`}
                  width={130}
                  height={140}
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                  }}
                />
              </div>
            ))}
          {profile.portfolio && profile.portfolio.length === 0 && (
            <div className='col-span-6 text-center text-gray-500'>
              No portfolio items available.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Portfolio;
