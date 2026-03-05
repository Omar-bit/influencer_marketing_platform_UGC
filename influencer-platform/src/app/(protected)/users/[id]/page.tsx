'use client';

import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/utils/secrets';
import { useParams } from 'next/navigation';
import { getUserById } from '@/utils/api/handlers/user';
import Header, { HeaderSkeleton } from '@/components/user/profile/Header';
import SocialMediaStats, {
  ISocialMediaStats,
} from '@/components/user/profile/SocialMediaStats';
import PersonalInfos from '@/components/user/profile/PersonalInfos';
import Location from '@/components/user/profile/Location';
import Portfolio from '@/components/user/profile/Portfolio';
import Seperator from '@/components/ui/Seperator';
import useBrandCampaigns from '@/hooks/useBrandCampaigns';
import BrandProfileCampaigns from '@/components/user/profile/BrandProfileCampaigns';
import Reviews from '@/components/user/profile/Reviews';
import BrandInfo from '@/components/user/profile/BrandInfo';
import BrandDescription from '@/components/user/profile/BrandDescription';
import BrandContactInfo from '@/components/user/profile/BrandContactInfo';
import CollaborationPreferences from '@/components/user/profile/CollaborationPreferences';

interface UserProfile {
  _id: string;
  type: 'business' | 'influencer';
  name: string;
  profilePicture?: string;
  bio?: string;
  field?: string;
  address?: {
    country?: string;
    city?: string;
    timeZone?: string;
  };
  gender?: string;
  dateOfBirth?: string;
  spokenLanguages?: string[];
  availability?: string;
  portfolio?: string[];
  socialMedia: ISocialMediaStats[];
  // Brand-specific fields
  primaryNiche?: string;
  secondaryNiches?: string[];
  description?: string;
  brandTone?: string;
  website?: string;
  phone?: string;
  secondPhone?: string;
  email?: string;
  collaborationType?: string;
  preferredIndustry?: string;
  minimumRates?: {
    perReel?: [string | number, string];
  };
  previousCollaborations?: string;
}

export default function PublicProfilePage() {
  const { id } = useParams();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProfile = async () => {
      // Guard against undefined id during SSR/hydration
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await getUserById(id as string);
        console.log('Fetched profile:', data);

        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className='w-full overflow-x-hidden bg-white dark:bg-gray-900 flex flex-col items-center overflow-y-auto'>
        <HeaderSkeleton />
        <Seperator className='w-full my-4 !h-[0.8px]' type='neutral' />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white'>
        Profile not found
      </div>
    );
  }

  const profilePictureUrl =
    profile?.profilePicture && profile.profilePicture
      ? `${BACKEND_URL}/uploads/${profile.profilePicture}`
      : '/assets/influencer.jpg';

  return (
    <div className='w-full overflow-x-hidden bg-white dark:bg-gray-900 flex flex-col items-center overflow-y-auto'>
      {profile.type === 'influencer' ? (
        <>
          <Header profile={profile} profilePictureUrl={profilePictureUrl} />
          <Seperator className='w-full my-4 !h-[0.8px]' type='neutral' />
          <SocialMediaStats socialMedia={profile.socialMedia} />
          <Seperator className='w-full my-4 !h-[0.8px]' type='neutral' />
          <div className='w-full sm:w-[80%] md:w-[65%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 my-2 px-4'>
            <PersonalInfos profile={profile} />

            <Location profile={profile} />
          </div>
          <Seperator className='w-full my-4 !h-[0.8px]' type='neutral' />
          <Portfolio profile={profile} />
          <Seperator className='w-full my-4 !h-[0.8px] ' type='neutral' />
          <Reviews userId={profile._id} userType={profile.type} />
        </>
      ) : (
        <>
          <Header profile={profile} profilePictureUrl={profilePictureUrl} />
          <Seperator className='w-full my-4 !h-[0.8px]' type='neutral' />
          {profile.socialMedia && profile.socialMedia.length > 0 && (
            <>
              {/* <SocialMediaStats socialMedia={profile.socialMedia} /> */}
              <Seperator className='w-full my-4 !h-[0.8px]' type='neutral' />
            </>
          )}
          <div className='w-full sm:w-[80%] md:w-[65%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 my-2 px-4'>
            <BrandInfo profile={profile} />
            <Location profile={profile} />
          </div>
          <Seperator className='w-full my-4 !h-[0.8px]' type='neutral' />
          <div className='w-full sm:w-[80%] md:w-[65%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 my-2 px-4'>
            <BrandContactInfo profile={profile} />
            <CollaborationPreferences profile={profile} />
          </div>
          <Seperator className='w-full my-4 !h-[0.8px]' type='neutral' />
          <div className='w-full sm:w-[80%] md:w-[65%] mx-auto px-4'>
            <BrandDescription profile={profile} />
          </div>
          <Seperator className='w-full my-4 !h-[0.8px]' type='neutral' />
          <Portfolio profile={profile} />
          <Seperator className='w-full my-4 !h-[0.8px]' type='neutral' />
          <BrandProfileCampaigns brandId={id as string} />
          <Seperator className='w-full my-4 !h-[0.8px]' type='neutral' />
        </>
      )}
    </div>
  );
}
