'use client';

import ProfilePicture from '@/components/shared/ProfilePicture/ProfilePicture';
import SocialMediaLink from '@/components/shared/SocialMediaLink';
import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { getSocialMediaMetrics } from '@/utils/api/handlers/user';
import {
  getPersonalProfile,
  updateInfluencerProfile,
} from '@/utils/api/handlers/influencer';
import { SUPPORTED_SOCIAL_MEDIAS } from '@/utils/constants';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { BACKEND_URL } from '@/utils/secrets';

const tabs = [
  {
    label: 'Profile',
    value: 'profile',
  },

  {
    label: 'Content & Niche',
    value: 'content-niche',
  },
  {
    label: 'Social media',
    value: 'social-media',
  },
  {
    label: 'Collaboration details',
    value: 'collaboration-details',
  },
];
const GENDER_OPTIONS = [
  {
    label: 'Male',
    value: 'M',
  },
  {
    label: 'Female',
    value: 'F',
  },
];
const SPOKEN_LANGUAGE_OPTIONS = [
  { label: 'English', value: 'English' },
  { label: 'French', value: 'French' },
  { label: 'Arabic', value: 'Arabic' },
];
export default function InfluencerProfilePage() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].value);
  const tabsViews = {
    profile: <Profile />,
    'content-niche': <ContentNiche />,
    'social-media': <SocialMedias />,
    'collaboration-details': <CollaborationDetails />,
  };
  return (
    <div className='w-full max-w-full overflow-hidden dark:bg-gray-900'>
      <h1 className='text-xl text-brand-primary sm:text-2xl text-[#404040] dark:text-gray-100 font-bold px-2 sm:px-0'>
        Profile
      </h1>
      <main className='flex flex-col md:flex-row gap-4 p-2 sm:p-4 items-stretch md:h-[83vh]'>
        <div className='px-2 py-4 border shadow rounded-lg flex flex-col justify-between md:w-[250px] w-full dark:bg-gray-800 dark:border-gray-700'>
          <div className='flex gap-3 sm:gap-x-5 flex-col items-start'>
            {tabs.map((tab) => (
              <button
                key={tab.value}
                className={`px-2 py-1 rounded-md text-xs sm:text-sm font-semibold uppercase w-full p-2 border border-transparent ${
                  tab.value === activeTab
                    ? 'bg-brand-primary_10 rounded-md text-brand-primary dark:bg-brand-primary/20'
                    : 'text-brand-primary_10 hover:border-brand-primary hover:text-brand-primary dark:text-gray-300 dark:hover:text-brand-primary'
                }`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className='flex flex-col gap-2 mt-5'>
            <button className='bg-red-500 text-white px-4 py-2 rounded w-full text-sm dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 transition-colors'>
              Delete Account
            </button>
          </div>
        </div>
        <div className='flex-1 overflow-hidden'>
          {
            // @ts-ignore
            tabsViews[activeTab]
          }
        </div>
      </main>
    </div>
  );
}

interface Address {
  country: string;
  city: string;
  timeZone: string;
}

interface ProfileInformation {
  name: string;
  username: string;
  email: string;
  phone: string;
  secondPhone: string;
  gender: { label: string; value: string } | null;
  dateOfBirth: string;
  spokenLanguages: Array<{ label: string; value: string }>;
  address: Address;
}

function Profile() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [profile, setProfile] = useState<any>(null);
  const [informations, setInformations] = useState<ProfileInformation>({
    name: '',
    username: '',
    email: '',
    phone: '',
    secondPhone: '',
    gender: null,
    dateOfBirth: '',
    spokenLanguages: [],
    address: {
      country: '',
      city: '',
      timeZone: '',
    },
  });
  const profilePicture = profile?.profilePicture;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDisabled = !isEditing;

  const handleInputChange =
    (field: string, nestedField?: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (nestedField) {
        setInformations((prev: ProfileInformation) => ({
          ...prev,
          [field]: {
            // @ts-ignore
            ...prev[field],
            [nestedField]: e.target.value,
          },
        }));
      } else {
        setInformations((prev) => ({ ...prev, [field]: e.target.value }));
      }
    };

  // @ts-ignore
  const userId = user?._id;

  function cancelEditing() {
    if (profile) {
      setInformations({
        name: profile.name || '',
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
        secondPhone: profile.secondPhone || '',
        gender: profile.gender
          ? GENDER_OPTIONS.find((gen) => gen.value === profile.gender) || null
          : null,
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().slice(0, 10)
          : '',
        spokenLanguages: Array.isArray(profile.spokenLanguages)
          ? profile.spokenLanguages.map((lang: any) => {
              if (typeof lang === 'object' && lang?.value) {
                return lang;
              }
              return { label: String(lang), value: String(lang) };
            })
          : [],
        address: {
          country: profile?.address?.country || '',
          city: profile?.address?.city || '',
          timeZone: profile?.address?.timeZone || '',
        },
      });
    }
    setIsEditing(false);
    setError(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }

  const handleProfilePictureClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const data: any = { ...informations };

      data.spokenLanguages = Array.isArray(data.spokenLanguages)
        ? data.spokenLanguages.map((lang: any) =>
            typeof lang === 'object' && lang?.value ? lang.value : String(lang)
          )
        : [];

      data.gender = data.gender?.value || null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('profilePicture', selectedFile);

        Object.entries(data).forEach(([key, value]) => {
          if (value === null || value === undefined) return;

          if (key === 'spokenLanguages' || key === 'address') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        });

        const response = await updateInfluencerProfile(userId, formData);
        console.log('response', response);

        // Update the session with the new profile data
        if (response.data?.data) {
          const updatedUserData = response.data.data;
          await update({
            ...session,
            user: {
              ...session?.user,
              name: updatedUserData.name,
              username: updatedUserData.username,
              profilePicture: updatedUserData.profilePicture,
              gender: updatedUserData.gender,
              phone: updatedUserData.phone,
              secondPhone: updatedUserData.secondPhone,
              dateOfBirth: updatedUserData.dateOfBirth,
              spokenLanguages: updatedUserData.spokenLanguages,
              address: updatedUserData.address,
            },
          });
        } else {
          await update();
        }
      } else {
        const response = await updateInfluencerProfile(userId, data);
        console.log('response', response);
        // Update the session with the new profile data
        if (response.data) {
          const updatedUserData = response.data.data;
          await update({
            ...session,
            user: {
              ...session?.user,
              name: updatedUserData.name,
              username: updatedUserData.username,
              gender: updatedUserData.gender,
              phone: updatedUserData.phone,
              secondPhone: updatedUserData.secondPhone,
              dateOfBirth: updatedUserData.dateOfBirth,
              spokenLanguages: updatedUserData.spokenLanguages,
              address: updatedUserData.address,
            },
          });
        } else {
          await update();
        }
      }

      setIsEditing(false);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);

      // Fetch updated profile data
      await fetchProfile();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function fetchProfile() {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await getPersonalProfile(userId);
      const profileData = response.data;

      setProfile(profileData);

      setInformations({
        name: profileData?.name || '',
        username: profileData?.username || '',
        email: profileData?.email || '',
        phone: profileData?.phone || '',
        secondPhone: profileData?.secondPhone || '',
        gender: profileData?.gender
          ? GENDER_OPTIONS.find((gen) => gen.value === profileData.gender) ||
            null
          : null,
        dateOfBirth: profileData?.dateOfBirth
          ? new Date(profileData.dateOfBirth).toISOString().slice(0, 10)
          : '',
        spokenLanguages: Array.isArray(profileData?.spokenLanguages)
          ? profileData.spokenLanguages.map((lang: any) => {
              if (typeof lang === 'object' && lang?.value) {
                return lang;
              }
              return { label: String(lang), value: String(lang) };
            })
          : [],
        address: {
          country: profileData?.address?.country || '',
          city: profileData?.address?.city || '',
          timeZone: profileData?.address?.timeZone || '',
        },
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || 'Failed to load profile';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [userId, user]);

  return (
    <div
      className={`w-full h-full flex flex-col gap-2 ${
        isEditing ? 'justify-between' : ''
      }`}
    >
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 w-full sm:w-auto'>
          <div
            className={`${isEditing ? 'cursor-pointer relative group' : ''}`}
          >
            <ProfilePicture
              src={
                previewUrl ||
                (profilePicture
                  ? `${BACKEND_URL}/uploads/${profilePicture}`
                  : null)
              }
              alt='Profile Picture'
              size='large'
            />
            {isEditing && (
              <div
                className='absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={handleProfilePictureClick}
              >
                <span className='text-white text-xs'>Change</span>
              </div>
            )}
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='image/*'
              className='hidden'
            />
          </div>
          <div className=''>
            <h3 className='text-sm font-semibold text-black dark:text-white'>
              {informations.name}
            </h3>
            <h3 className='text-sm font-normal text-black dark:text-gray-300'>
              @{informations.username}
            </h3>
          </div>
        </div>
        {!isEditing && (
          <Button user='brand' onClick={() => setIsEditing((prev) => !prev)}>
            Edit
          </Button>
        )}
      </div>
      <div
        className={`space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]  ${
          isEditing ? 'h-[40vh] md:h-[55vh]' : ''
        }`}
      >
        <div className='flex flex-col gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
          <h3 className='text-md text-brand-primary font-semibold dark:text-brand-primary'>
            Personal Information
          </h3>
          <div className='flex flex-wrap w-full gap-3 p-3'>
            <Input
              label='Full Name'
              placeholder='Full Name'
              value={informations.name}
              onChange={handleInputChange('name')}
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[48%]' }}
            />
            <Input
              label='Nickname'
              placeholder='Nickname'
              value={informations.username}
              onChange={handleInputChange('username')}
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[48%]' }}
            />
            <Input
              label='Email Address'
              placeholder='Email Address'
              value={informations.email}
              onChange={handleInputChange('email')}
              type='text'
              isDisabled={true}
              className={{ container: 'w-full' }}
            />
            <Input
              label='Phone Number'
              placeholder='+216 55 555 555'
              value={informations.phone}
              onChange={handleInputChange('phone')}
              type='phone'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[48%]' }}
            />
            <Input
              label='Second Number'
              placeholder='+216 55 555 555'
              value={informations.secondPhone}
              onChange={handleInputChange('secondPhone')}
              type='phone'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[48%]' }}
            />
            <Select
              options={[
                { label: 'Female', value: 'F' },
                { label: 'Male', value: 'M' },
              ]}
              setValue={(value) =>
                setInformations((prev) => ({ ...prev, gender: value }))
              }
              label='Gender'
              value={informations.gender}
              isDisabled={isDisabled}
              styles={{
                control: {
                  border: '1px solid #d1d5db  !important',
                },
              }}
              className={{
                container: 'w-full sm:w-[48%]',
              }}
            />
            <Input
              label='Date of Birth'
              placeholder='Date of Birth'
              value={informations.dateOfBirth}
              onChange={handleInputChange('dateOfBirth')}
              type='date'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[48%]' }}
            />
            <Select
              options={SPOKEN_LANGUAGE_OPTIONS}
              setValue={(value) => {
                setInformations((prev: any) => ({
                  ...prev,
                  spokenLanguages: value,
                }));
              }}
              label='Spoken Languages'
              value={informations.spokenLanguages}
              isDisabled={isDisabled}
              styles={{
                control: {
                  border: '1px solid #d1d5db  !important',
                },
              }}
              className={{
                container: 'w-full',
              }}
              isMulti={true}
            />
          </div>
        </div>
        <div className='flex flex-col gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
          <h3 className='text-md text-brand-primary font-semibold dark:text-brand-primary'>
            Address Information
          </h3>
          <div className='flex flex-wrap w-full gap-3 p-3'>
            <Input
              label='Country'
              placeholder='Country'
              value={informations.address.country}
              onChange={handleInputChange('address', 'country')}
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[31%]' }}
            />
            <Input
              label='City'
              placeholder='City'
              value={informations.address.city}
              onChange={handleInputChange('address', 'city')}
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[31%]' }}
            />
            <Input
              label='Time Zone'
              placeholder='Time Zone'
              value={informations.address.timeZone}
              onChange={handleInputChange('address', 'timeZone')}
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[31%]' }}
            />
          </div>
        </div>
      </div>
      {error && <div className='text-red-500 text-sm px-2'>{error}</div>}
      {isEditing && (
        <footer className='flex justify-end items-center gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 justify-self-end w-full dark:bg-gray-800 dark:border-gray-700'>
          <Button
            user='brand'
            variant='outlined'
            color='primary'
            onClick={cancelEditing}
            disabled={loading}
            className='w-full sm:w-auto'
          >
            Cancel
          </Button>
          <Button
            user='brand'
            onClick={handleSave}
            disabled={loading}
            className='w-full sm:w-auto'
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </footer>
      )}
    </div>
  );
}

function ContentNiche() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [newPortfolioImage, setNewPortfolioImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRIMARY_NICHE_OPTIONS = [
    { label: 'Fashion', value: 'Fashion' },
    { label: 'Beauty', value: 'Beauty' },
    { label: 'Travel', value: 'Travel' },
    { label: 'Food', value: 'Food' },
    { label: 'Fitness', value: 'Fitness' },
    { label: 'Technology', value: 'Technology' },
    { label: 'Gaming', value: 'Gaming' },
    { label: 'Lifestyle', value: 'Lifestyle' },
  ];

  const SECONDARY_NICHE_OPTIONS = [
    { label: 'Lifestyle', value: 'Lifestyle' },
    { label: 'Beauty', value: 'Beauty' },
    { label: 'Travel', value: 'Travel' },
    { label: 'Food', value: 'Food' },
    { label: 'Fitness', value: 'Fitness' },
    { label: 'Technology', value: 'Technology' },
    { label: 'Gaming', value: 'Gaming' },
    { label: 'Fashion', value: 'Fashion' },
  ];

  const [contentData, setContentData] = useState({
    primaryNiche: null as { label: string; value: string } | null,
    secondaryNiches: [] as Array<{ label: string; value: string }>,
    bio: '',
    mainContentTypes: '',
    brandTone: '',
    previousCollaborations: '',
    portfolio: [] as string[],
  });

  const isDisabled = !isEditing;

  // @ts-ignore
  const userId = user?._id;

  const handlePortfolioFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setNewPortfolioImage(e.target.files[0]);

      // Generate a preview URL for the new portfolio image
      const previewUrl = URL.createObjectURL(e.target.files[0]);
      setPortfolioImages((prev) => [...prev, previewUrl]);
    }
  };

  const handleAddPortfolioImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  function cancelEditing() {
    if (profile) {
      setContentData({
        primaryNiche:
          PRIMARY_NICHE_OPTIONS.find(
            (niche) => niche.value === profile.primaryNiche
          ) ?? null,
        secondaryNiches: Array.isArray(profile.secondaryNiches)
          ? profile.secondaryNiches.map((niche: string) => ({
              label: niche,
              value: niche,
            }))
          : [],
        bio: profile.bio || '',
        mainContentTypes: profile.mainContentTypes || '',
        brandTone: profile.brandTone || '',
        previousCollaborations: profile.previousCollaborations || '',
        portfolio: profile.portfolio || [],
      });
    }
    setIsEditing(false);
    setError(null);
    setNewPortfolioImage(null);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const data: any = { ...contentData };

      data.primaryNiche = data.primaryNiche?.value || null;
      data.secondaryNiches = data.secondaryNiches.map(
        (niche: any) => niche.value
      );

      if (newPortfolioImage) {
        const formData = new FormData();
        formData.append('portfolioImage', newPortfolioImage);

        Object.entries(data).forEach(([key, value]) => {
          if (value === null || value === undefined) return;

          if (key === 'secondaryNiches' || key === 'portfolio') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        });

        await updateInfluencerProfile(userId, formData);
      } else {
        await updateInfluencerProfile(userId, data);
      }

      await update();
      setIsEditing(false);
      setNewPortfolioImage(null);

      // Clear preview URLs after saving
      fetchProfile();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile');
      console.error('Error updating content & niche:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await getPersonalProfile(userId);
      const profileData = response.data;

      setProfile(profileData);
      setContentData({
        primaryNiche:
          PRIMARY_NICHE_OPTIONS.find(
            (niche) => niche.value === profileData.primaryNiche
          ) ?? null,
        secondaryNiches: Array.isArray(profileData?.secondaryNiches)
          ? profileData.secondaryNiches.map((niche: string) => ({
              label: niche,
              value: niche,
            }))
          : [],
        bio: profileData?.bio || '',
        mainContentTypes: profileData?.mainContentTypes || '',
        brandTone: profileData?.brandTone || '',
        previousCollaborations: profileData?.previousCollaborations || '',
        portfolio: profileData?.portfolio || [],
      });

      if (profileData?.portfolio) {
        setPortfolioImages(profileData.portfolio);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [userId, user]);

  return (
    <div
      className={`w-full h-full flex flex-col gap-2 ${
        isEditing ? 'justify-between' : ''
      }`}
    >
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
        <h3 className='text-md text-brand-primary font-semibold dark:text-brand-primary'>
          Content & Niche Information
        </h3>
        {!isEditing && (
          <Button user='brand' onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      <div
        className={`space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]  ${
          isEditing ? 'h-[40vh] md:h-[55vh]' : ''
        }`}
      >
        <div className='flex flex-col gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
          <div className='flex flex-wrap w-full gap-3 p-3'>
            <Select
              options={PRIMARY_NICHE_OPTIONS}
              setValue={(value) =>
                setContentData((prev) => ({ ...prev, primaryNiche: value }))
              }
              label='Primary Niche'
              value={contentData.primaryNiche}
              isDisabled={isDisabled}
              styles={{
                control: {
                  border: '1px solid #d1d5db !important',
                },
              }}
              className={{
                container: 'w-full sm:w-[48%]',
              }}
            />

            <Select
              options={SECONDARY_NICHE_OPTIONS}
              setValue={(value) =>
                setContentData((prev) => ({ ...prev, secondaryNiches: value }))
              }
              label='Secondary Niche(s)'
              value={contentData.secondaryNiches}
              isDisabled={isDisabled}
              styles={{
                control: {
                  border: '1px solid #d1d5db !important',
                },
              }}
              className={{
                container: 'w-full sm:w-[48%]',
              }}
              isMulti={true}
            />

            <div className='w-full'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Bio
              </label>
              <textarea
                className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                rows={4}
                value={contentData.bio}
                onChange={(e) =>
                  setContentData((prev) => ({ ...prev, bio: e.target.value }))
                }
                disabled={isDisabled}
                placeholder='Fashion enthusiast and lifestyle blogger with 7+ years of experience...'
              />
            </div>

            <Input
              label='Main Content Types'
              placeholder='Fashion Hauls, Styling Tips, Brand Reviews'
              value={contentData.mainContentTypes}
              onChange={(e) =>
                setContentData((prev) => ({
                  ...prev,
                  mainContentTypes: e.target.value,
                }))
              }
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full' }}
            />

            <Input
              label='Brand Tone'
              placeholder='Playful, Professional, Educational'
              value={contentData.brandTone}
              onChange={(e) =>
                setContentData((prev) => ({
                  ...prev,
                  brandTone: e.target.value,
                }))
              }
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full' }}
            />

            <div className='w-full'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Previous Collaborations
              </label>
              <textarea
                className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                rows={4}
                value={contentData.previousCollaborations}
                onChange={(e) =>
                  setContentData((prev) => ({
                    ...prev,
                    previousCollaborations: e.target.value,
                  }))
                }
                disabled={isDisabled}
                placeholder='Chanel (https://instagram.com/p/xyz123)...'
              />
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
          <h3 className='text-md text-brand-primary font-semibold dark:text-brand-primary'>
            Portfolio
          </h3>
          <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-2'>
            {portfolioImages.map((image, index) => (
              <div
                key={index}
                className='relative border rounded-lg overflow-hidden h-[120px] sm:h-[150px] dark:border-gray-600'
              >
                <img
                  src={
                    image.startsWith('blob:')
                      ? image
                      : `${BACKEND_URL}/uploads/${image}`
                  }
                  alt={`Portfolio ${index + 1}`}
                  className='w-full h-full object-cover'
                />
                {isEditing && (
                  <button
                    className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1'
                    onClick={() => {
                      const newPortfolio = [...portfolioImages];
                      newPortfolio.splice(index, 1);
                      setPortfolioImages(newPortfolio);
                      setContentData((prev) => ({
                        ...prev,
                        portfolio: newPortfolio,
                      }));
                    }}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {isEditing && (
              <div
                className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center h-[120px] sm:h-[150px] cursor-pointer hover:border-brand-primary'
                onClick={handleAddPortfolioImage}
              >
                <div className='flex flex-col items-center'>
                  <span className='text-gray-500 dark:text-gray-400 text-sm sm:text-base'>
                    Add Image
                  </span>
                </div>
              </div>
            )}

            <input
              type='file'
              ref={fileInputRef}
              onChange={handlePortfolioFileChange}
              accept='image/*'
              className='hidden'
            />
          </div>
        </div>
      </div>

      {error && <div className='text-red-500 text-sm px-2'>{error}</div>}

      {isEditing && (
        <footer className='flex flex-col sm:flex-row justify-end items-center gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 justify-self-end w-full dark:bg-gray-800 dark:border-gray-700'>
          <Button
            user='brand'
            variant='outlined'
            color='primary'
            onClick={cancelEditing}
            disabled={loading}
            className='w-full sm:w-auto'
          >
            Cancel
          </Button>
          <Button
            user='brand'
            onClick={handleSave}
            disabled={loading}
            className='w-full sm:w-auto'
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </footer>
      )}
    </div>
  );
}

function SocialMedias() {
  const { data: session } = useSession();
  const [socialMediaData, setSocialMediaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch social media metrics on component mount
  useEffect(() => {
    async function fetchSocialMediaMetrics() {
      try {
        setLoading(true);
        const response = await getSocialMediaMetrics();
        if (response.success && response.data) {
          setSocialMediaData(response.data);
        }
      } catch (err: any) {
        console.error('Error fetching social media metrics:', err);
        setError(
          err?.response?.data?.message || 'Failed to load social media data'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSocialMediaMetrics();
  }, []);

  // Helper to format follower counts
  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-[calc(100vh-200px)]'>
      {SUPPORTED_SOCIAL_MEDIAS.map((socialMedia) => {
        const Icon = socialMedia.svg;
        // Find if this social media platform is linked
        const account = socialMediaData.find(
          (acc) => acc.platform.toLowerCase() === socialMedia.name.toLowerCase()
        );

        // If social media account is linked, show details instead of link button
        if (account) {
          return (
            <div
              key={socialMedia.name}
              className={`w-full border rounded-lg shadow p-4 flex flex-col h-auto min-h-[200px] sm:h-[34.5vh] ${socialMedia.background}`}
              style={{ background: socialMedia.background }}
            >
              <div className='flex justify-between items-center mb-4 sm:mb-6'>
                <Icon className='size-6 sm:size-8 text-white' />
                <span className='text-white font-bold text-sm sm:text-base'>
                  @{account.username}
                </span>
              </div>

              <div className='flex-grow flex flex-col justify-center items-center text-center'>
                <div className='text-white text-2xl sm:text-3xl font-bold mb-1'>
                  {formatFollowers(account.followers)}
                </div>
                <div className='text-white opacity-90 text-xs sm:text-sm'>
                  Followers
                </div>

                {account.likesCount && (
                  <div className='mt-3 sm:mt-4'>
                    <div className='text-white text-2xl sm:text-3xl font-bold mb-1'>
                      {formatFollowers(account.likesCount)}
                    </div>
                    <div className='text-white opacity-90 text-xs sm:text-sm'>
                      Likes
                    </div>
                  </div>
                )}

                {account.engagementRate && (
                  <div className='mt-3 sm:mt-4'>
                    <div className='text-white text-2xl sm:text-3xl font-bold mb-1'>
                      {account.engagementRate}%
                    </div>
                    <div className='text-white opacity-90 text-xs sm:text-sm'>
                      Engagement
                    </div>
                  </div>
                )}
              </div>

              <div className='text-white text-xs mt-3 sm:mt-4 text-center opacity-80'>
                Average Views:{' '}
                {formatFollowers(
                  account.avgViews || Math.floor(account.followers * 0.3)
                )}
              </div>
            </div>
          );
        }

        // If not linked, show the link button UI
        return (
          <SocialMediaLink social={socialMedia.name} key={socialMedia.name}>
            <div
              className={`w-full border rounded-lg shadow p-2 flex flex-col items-center justify-center gap-5 sm:gap-10 h-auto min-h-[200px] sm:h-[34.5vh] cursor-pointer hover:opacity-75 ${socialMedia.background}`}
              style={{ background: socialMedia.background }}
            >
              <Icon className='size-8 sm:size-10 md:size-12 text-white' />
              <span className='text-white font-semibold text-sm sm:text-base'>
                Link your {socialMedia.name}
              </span>
            </div>
          </SocialMediaLink>
        );
      })}
    </div>
  );
}

function CollaborationDetails() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const COLLABORATION_TYPES = [
    { label: 'Gifting', value: 'Gifting' },
    { label: 'Paid Partnership', value: 'Paid Partnership' },
    { label: 'Affiliate Marketing', value: 'Affiliate Marketing' },
    { label: 'Brand Ambassador', value: 'Brand Ambassador' },
  ];

  const INDUSTRY_OPTIONS = [
    { label: 'Lifestyle', value: 'Lifestyle' },
    { label: 'Beauty', value: 'Beauty' },
    { label: 'Travel', value: 'Travel' },
    { label: 'Fashion', value: 'Fashion' },
    { label: 'Food', value: 'Food' },
    { label: 'Fitness', value: 'Fitness' },
    { label: 'Technology', value: 'Technology' },
    { label: 'Gaming', value: 'Gaming' },
  ];

  const COUNTRY_OPTIONS = [
    { label: 'USA', value: 'USA' },
    { label: 'UK', value: 'UK' },
    { label: 'Canada', value: 'Canada' },
    { label: 'Australia', value: 'Australia' },
    { label: 'France', value: 'France' },
    { label: 'Germany', value: 'Germany' },
  ];

  const [collaborationData, setCollaborationData] = useState({
    walletId: null as string | null,
    collaborationType: null as { label: string; value: string } | null,
    preferredIndustry: null as { label: string; value: string } | null,
    minimumRates: {
      perReel: ['', ''],
      perCarousel: ['', ''],
      perCarouselReel: ['', ''],
    },
    availability: '',
    shippingAddress: {
      addressLine1: '',
      addressLine2: '',
      zipCode: '',
      country: null as { label: string; value: string } | null,
      city: null as { label: string; value: string } | null,
    },
  });

  const isDisabled = !isEditing;

  // @ts-ignore
  const userId = user?._id;

  function handleRateChange(
    category: 'perReel' | 'perCarousel' | 'perCarouselReel',
    index: number,
    value: string
  ) {
    setCollaborationData((prev) => {
      const updatedRates = { ...prev.minimumRates };
      updatedRates[category][index] = value;
      return {
        ...prev,
        minimumRates: updatedRates,
      };
    });
  }

  function handleAddressChange(field: string, value: any) {
    setCollaborationData((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value,
      },
    }));
  }

  function cancelEditing() {
    if (profile) {
      setCollaborationData({
        walletId: profile.walletId || null,
        collaborationType:
          COLLABORATION_TYPES.find(
            (type) => type.value === profile.collaborationType
          ) ?? null,
        preferredIndustry:
          INDUSTRY_OPTIONS.find(
            (industry) => industry.value === profile.preferredIndustry
          ) ?? null,
        minimumRates: {
          perReel: Array.isArray(profile.minimumRates?.perReel)
            ? [...profile.minimumRates.perReel]
            : ['', ''],
          perCarousel: Array.isArray(profile.minimumRates?.perCarousel)
            ? [...profile.minimumRates.perCarousel]
            : ['', ''],
          perCarouselReel: Array.isArray(profile.minimumRates?.perCarouselReel)
            ? [...profile.minimumRates.perCarouselReel]
            : ['', ''],
        },
        availability: profile.availability || '',
        shippingAddress: {
          addressLine1: profile.shippingAddress?.addressLine1 || '',
          addressLine2: profile.shippingAddress?.addressLine2 || '',
          zipCode: profile.shippingAddress?.zipCode || '',
          country:
            COUNTRY_OPTIONS.find(
              (country) => country.value === profile.shippingAddress.country
            ) ?? null,
          city: profile.shippingAddress?.city
            ? {
                label: profile.shippingAddress.city,
                value: profile.shippingAddress.city,
              }
            : null,
        },
      });
    }
    setIsEditing(false);
    setError(null);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const data: any = {
        walletId: collaborationData.walletId,
        collaborationType: collaborationData.collaborationType?.value || null,
        preferredIndustry: collaborationData.preferredIndustry?.value || null,
        minimumRates: {
          perReel: collaborationData.minimumRates.perReel,
          perCarousel: collaborationData.minimumRates.perCarousel,
          perCarouselReel: collaborationData.minimumRates.perCarouselReel,
        },
        availability: collaborationData.availability,
        shippingAddress: {
          addressLine1: collaborationData.shippingAddress.addressLine1,
          addressLine2: collaborationData.shippingAddress.addressLine2,
          zipCode: collaborationData.shippingAddress.zipCode,
          country: collaborationData.shippingAddress.country?.value || null,
          city: collaborationData.shippingAddress.city?.value || null,
        },
      };

      await updateInfluencerProfile(userId, data);
      await update({
        ...session,
        user: {
          ...user,
          walletId: data.walletId,
        },
      });
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to update collaboration details'
      );
      console.error('Error updating collaboration details:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await getPersonalProfile(userId);
      const profileData = response.data;
      console.log('Profile Data:', profileData);

      setProfile(profileData);
      setCollaborationData({
        walletId: profileData.walletId || null,
        collaborationType:
          COLLABORATION_TYPES.find(
            (type) => type.value === profileData.collaborationType
          ) ?? null,
        preferredIndustry:
          INDUSTRY_OPTIONS.find(
            (industry) => industry.value === profileData.preferredIndustry
          ) ?? null,
        minimumRates: {
          perReel: Array.isArray(profileData?.minimumRates?.perReel)
            ? [...profileData.minimumRates.perReel]
            : ['', ''],
          perCarousel: Array.isArray(profileData?.minimumRates?.perCarousel)
            ? [...profileData.minimumRates.perCarousel]
            : ['', ''],
          perCarouselReel: Array.isArray(
            profileData?.minimumRates?.perCarouselReel
          )
            ? [...profileData.minimumRates.perCarouselReel]
            : ['', ''],
        },
        availability: profileData?.availability || '',
        shippingAddress: {
          addressLine1: profileData?.shippingAddress?.addressLine1 || '',
          addressLine2: profileData?.shippingAddress?.addressLine2 || '',
          zipCode: profileData?.shippingAddress?.zipCode || '',
          country:
            COUNTRY_OPTIONS.find(
              (country) =>
                country.value === profileData?.shippingAddress?.country
            ) ?? null,
          city: profileData?.shippingAddress?.city
            ? {
                label: profileData?.shippingAddress?.city,
                value: profileData?.shippingAddress?.city,
              }
            : null,
        },
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err?.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [userId, user]);

  const getCityOptions = () => {
    if (!collaborationData.shippingAddress.country) return [];

    const citiesByCountry: Record<
      string,
      Array<{ label: string; value: string }>
    > = {
      USA: [
        { label: 'New York', value: 'New York' },
        { label: 'Los Angeles', value: 'Los Angeles' },
        { label: 'Chicago', value: 'Chicago' },
      ],
      UK: [
        { label: 'London', value: 'London' },
        { label: 'Manchester', value: 'Manchester' },
        { label: 'Birmingham', value: 'Birmingham' },
      ],
    };

    return (
      citiesByCountry[collaborationData.shippingAddress.country.value] || []
    );
  };

  return (
    <div
      className={`w-full h-full flex flex-col gap-2 ${
        isEditing ? 'justify-between' : ''
      }`}
    >
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
        <h3 className='text-md text-brand-primary font-semibold dark:text-brand-primary'>
          Collaboration Details
        </h3>
        {!isEditing && (
          <Button user='brand' onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      <div
        className={`space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] ${
          isEditing ? 'h-[40vh] md:h-[55vh]' : ''
        }`}
      >
        <div className='flex flex-col gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
          <Input
            label='Konnect Wallet(Mandatory for Payment)'
            placeholder='xxxxxxxxxxxx'
            value={collaborationData.walletId || ''}
            onChange={(e) =>
              setCollaborationData((prev) => ({
                ...prev,
                walletId: e.target.value,
              }))
            }
            type='text'
            isDisabled={isDisabled}
            className={{ container: 'w-full' }}
          />
        </div>
        <div className='flex flex-col gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
          <div className='flex flex-wrap w-full gap-3 p-3'>
            <Select
              options={COLLABORATION_TYPES}
              setValue={(value) =>
                setCollaborationData((prev) => ({
                  ...prev,
                  collaborationType: value,
                }))
              }
              label='Type of Collaboration Preferred'
              value={collaborationData.collaborationType}
              isDisabled={isDisabled}
              styles={{
                control: {
                  border: '1px solid #d1d5db !important',
                },
              }}
              className={{
                container: 'w-full sm:w-[48%]',
              }}
            />

            <Select
              options={INDUSTRY_OPTIONS}
              setValue={(value) =>
                setCollaborationData((prev) => ({
                  ...prev,
                  preferredIndustry: value,
                }))
              }
              label='Preferred Industry'
              value={collaborationData.preferredIndustry}
              isDisabled={isDisabled}
              styles={{
                control: {
                  border: '1px solid #d1d5db !important',
                },
              }}
              className={{
                container: 'w-full sm:w-[48%]',
              }}
            />
          </div>
        </div>

        <div className='flex flex-col gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
          <h3 className='text-md text-brand-primary font-semibold dark:text-brand-primary'>
            Minimum Rates
          </h3>
          <div className='flex flex-wrap w-full gap-3 p-3'>
            <div className='w-full'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Per Reel
              </p>
              <div className='flex flex-col sm:flex-row gap-2'>
                <Input
                  placeholder='10TND'
                  value={collaborationData.minimumRates.perReel[0]}
                  onChange={(e) =>
                    handleRateChange('perReel', 0, e.target.value)
                  }
                  type='text'
                  isDisabled={isDisabled}
                  className={{ container: 'w-full' }}
                />
                <Input
                  placeholder='10TND'
                  value={collaborationData.minimumRates.perReel[1]}
                  onChange={(e) =>
                    handleRateChange('perReel', 1, e.target.value)
                  }
                  type='text'
                  isDisabled={isDisabled}
                  className={{ container: 'w-full' }}
                />
              </div>
            </div>

            <div className='w-full'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Per Carousel
              </p>
              <div className='flex flex-col sm:flex-row gap-2'>
                <Input
                  placeholder='10TND'
                  value={collaborationData.minimumRates.perCarousel[0]}
                  onChange={(e) =>
                    handleRateChange('perCarousel', 0, e.target.value)
                  }
                  type='text'
                  isDisabled={isDisabled}
                  className={{ container: 'w-full' }}
                />
                <Input
                  placeholder='10TND'
                  value={collaborationData.minimumRates.perCarousel[1]}
                  onChange={(e) =>
                    handleRateChange('perCarousel', 1, e.target.value)
                  }
                  type='text'
                  isDisabled={isDisabled}
                  className={{ container: 'w-full' }}
                />
              </div>
            </div>

            <div className='w-full'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Per Carousel + Reel
              </p>
              <div className='flex flex-col sm:flex-row gap-2'>
                <Input
                  placeholder='10TND'
                  value={collaborationData.minimumRates.perCarouselReel[0]}
                  onChange={(e) =>
                    handleRateChange('perCarouselReel', 0, e.target.value)
                  }
                  type='text'
                  isDisabled={isDisabled}
                  className={{ container: 'w-full' }}
                />
                <Input
                  placeholder='10TND'
                  value={collaborationData.minimumRates.perCarouselReel[1]}
                  onChange={(e) =>
                    handleRateChange('perCarouselReel', 1, e.target.value)
                  }
                  type='text'
                  isDisabled={isDisabled}
                  className={{ container: 'w-full' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
          <h3 className='text-md text-brand-primary font-semibold dark:text-brand-primary'>
            Availability
          </h3>
          <div className='p-3'>
            <Input
              label='When are you available'
              placeholder='Monday to Friday, 10 AM - 6 PM CET'
              value={collaborationData.availability}
              onChange={(e) =>
                setCollaborationData((prev) => ({
                  ...prev,
                  availability: e.target.value,
                }))
              }
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full' }}
            />
          </div>
        </div>

        <div className='flex flex-col gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
          <h3 className='text-md text-brand-primary font-semibold dark:text-brand-primary'>
            Shipping Address
          </h3>
          <div className='flex flex-wrap w-full gap-3 p-3'>
            <Input
              label='Address Line 1'
              placeholder='Address line 1'
              value={collaborationData.shippingAddress.addressLine1}
              onChange={(e) =>
                handleAddressChange('addressLine1', e.target.value)
              }
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full' }}
            />
            <Input
              label='Address Line 2'
              placeholder='Address line 2'
              value={collaborationData.shippingAddress.addressLine2}
              onChange={(e) =>
                handleAddressChange('addressLine2', e.target.value)
              }
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full' }}
            />
            <Input
              label='ZIP Code'
              placeholder='ZIP Code'
              value={collaborationData.shippingAddress.zipCode}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[32%]' }}
            />
            <Select
              options={COUNTRY_OPTIONS}
              setValue={(value) => handleAddressChange('country', value)}
              label='Country'
              value={collaborationData.shippingAddress.country}
              isDisabled={isDisabled}
              styles={{
                control: {
                  border: '1px solid #d1d5db !important',
                },
              }}
              className={{
                container: 'w-full sm:w-[32%]',
              }}
            />
            <Select
              options={getCityOptions()}
              setValue={(value) => handleAddressChange('city', value)}
              label='City'
              value={collaborationData.shippingAddress.city}
              isDisabled={
                isDisabled || !collaborationData.shippingAddress.country
              }
              styles={{
                control: {
                  border: '1px solid #d1d5db !important',
                },
              }}
              className={{
                container: 'w-full sm:w-[32%]',
              }}
            />
          </div>
        </div>
      </div>

      {error && <div className='text-red-500 text-sm px-2'>{error}</div>}

      {isEditing && (
        <footer className='flex flex-col sm:flex-row justify-end items-center gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 justify-self-end w-full dark:bg-gray-800 dark:border-gray-700'>
          <Button
            user='brand'
            variant='outlined'
            color='primary'
            onClick={cancelEditing}
            disabled={loading}
            className='w-full sm:w-auto'
          >
            Cancel
          </Button>
          <Button
            user='brand'
            onClick={handleSave}
            disabled={loading}
            className='w-full sm:w-auto'
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </footer>
      )}
    </div>
  );
}
