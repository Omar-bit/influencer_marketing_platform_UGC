import ProfilePicture from '@/components/shared/ProfilePicture/ProfilePicture';
import BackLink from '@/components/ui/BackLink';
import Button from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { TbMailFilled } from 'react-icons/tb';

type HeaderProps = {
  profile: any /* {
        name: string;
        nickname: string;
        address?: {
        city?: string;
        country?: string;
        };
        bio?: string;
    }*/;
  profilePictureUrl?: string;
};

export function HeaderSkeleton() {
  return (
    <>
      <div className='bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 w-full h-24 relative animate-pulse'>
        <div className='absolute top-5 left-5 w-8 h-8 bg-gray-300 rounded-full'></div>
      </div>

      <div className='relative w-full md:w-[80%] px-4 flex flex-col'>
        <div className='flex flex-col sm:flex-row items-center sm:items-start'>
          {/* Profile Image Skeleton */}
          <div className='flex-shrink-0 -mt-12 shadow-lg rounded-full border-4 border-white mx-auto sm:mx-0'>
            <div className='w-24 h-24 rounded-full bg-gray-300 animate-pulse'></div>
          </div>

          {/* Name and info skeleton */}
          <div className='mt-4 pl-0 sm:pl-3 text-center sm:text-left w-full'>
            <div className='h-6 w-48 bg-gray-300 rounded animate-pulse mb-2'></div>
            <div className='flex flex-col sm:flex-row items-center'>
              <div className='h-4 w-24 bg-gray-200 rounded animate-pulse'></div>
              <div className='inline-flex items-center sm:ml-2 mt-1 sm:mt-0'>
                <div className='h-4 w-36 bg-gray-200 rounded animate-pulse ml-2'></div>
              </div>
            </div>

            {/* Bio skeleton */}
            <div className='my-2 max-w-3xl'>
              <div className='h-4 w-full bg-gray-200 rounded animate-pulse mb-2'></div>
              <div className='h-4 w-4/5 bg-gray-200 rounded animate-pulse'></div>
            </div>

            {/* Email skeleton */}
            <div className='flex items-center gap-1'>
              <div className='w-5 h-5 bg-gray-300 rounded animate-pulse mr-1'></div>
              <div className='h-4 w-40 bg-gray-200 rounded animate-pulse'></div>
            </div>
          </div>

          {/* Buttons skeleton */}
          <div className='sm:absolute static right-4 top-4 mt-4 sm:mt-0'>
            <div className='flex gap-2 justify-center sm:justify-start'>
              <div className='h-9 w-24 bg-gray-300 rounded animate-pulse'></div>
              <div className='h-9 w-32 bg-gray-300 rounded animate-pulse'></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Header({
  profile,
  profilePictureUrl = 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fHBpbmt8ZW58MHx8fHwxNjg5NTY1NzA3&ixlib=rb-4.0.3&q=80&w=400',
}: HeaderProps) {
  const { data: session } = useSession();
  //@ts-ignore
  const isLoggedUserBrand = session?.user?.type === 'business';
  const isBrandProfile = profile?.type === 'business';
  return (
    <>
      <div className='bg-gradient-to-r from-brand-primary via-influencer-secondary to-influencer-primary w-full h-24 relative'>
        <BackLink className=' absolute top-5 left-5   text-white text-4xl size-24' />
      </div>

      <div className='relative w-full md:w-[80%] px-4 flex flex-col'>
        <div className='flex flex-col sm:flex-row items-center sm:items-start'>
          {/* Profile Image */}
          <div className='flex-shrink-0 -mt-12 shadow-lg rounded-full border-4 border-white mx-auto sm:mx-0'>
            <ProfilePicture
              src={profilePictureUrl}
              alt={profile.name}
              size='large'
              className={{ container: 'size-24' }}
            />
          </div>

          {/* Name and nickname */}
          <div className='mt-4 pl-0 sm:pl-3 text-center sm:text-left w-full'>
            <h1 className='text-xl font-bold'>{profile.name}</h1>
            <div className='text-sm text-gray-500 flex flex-col sm:flex-row items-center'>
              {profile.field && (
                <span className=' capitalize'>{profile.field}</span>
              )}
              {profile.address?.country ? (
                <span className='inline-flex items-center sm:ml-2 mt-1 sm:mt-0'>
                  <svg
                    className='w-4 h-4 mr-1'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span>
                    {profile.address.city || 'Sousse'},{' '}
                    {profile.address.country || 'Tunisia'}
                  </span>
                </span>
              ) : (
                <span>N/A</span>
              )}
            </div>
            {/* Bio */}
            <div className='my-2 text-sm max-w-3xl'>
              {profile.bio || 'Bio not available.'}
            </div>
            <div className='flex items-center gap-1 text-sm '>
              <TbMailFilled className='size-5 mr-1 text-influencer-primary' />
              <span>{profile.email}</span>
            </div>
          </div>

          {/* Buttons - responsive position */}
          <div className='sm:absolute static right-4 top-4 mt-4 sm:mt-0'>
            <div className='flex gap-2 justify-center sm:justify-start'>
              {isLoggedUserBrand && (
                <Button
                  variant='filled'
                  color='primary'
                  className='text-sm font-medium'
                >
                  Add to List
                </Button>
              )}

              <Button
                user='influencer'
                variant={isBrandProfile ? 'filled' : 'outlined'}
                className='text-sm'
              >
                <div className='flex items-center justify-center gap-1'>
                  {isBrandProfile ? <TbMailFilled /> : undefined}
                  <span>Message{isBrandProfile && ' Brand'}</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
