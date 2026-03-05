'use client';

import ProfilePicture from '@/components/shared/ProfilePicture/ProfilePicture';
import SocialMediaLink from '@/components/shared/SocialMediaLink';
import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { getSocialMediaMetrics } from '@/utils/api/handlers/user';
import { SUPPORTED_SOCIAL_MEDIAS } from '@/utils/constants';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { BACKEND_URL } from '@/utils/secrets';
import { useRouter } from 'next/navigation';

// Assuming we will create these functions in the API handlers
import {
  getBrandProfile,
  updateBrandProfile,
  deleteBrandAccount,
} from '@/utils/api/handlers/brand';

const tabs = [
  {
    label: 'Profile',
    value: 'profile',
  },
  {
    label: 'Brand Details',
    value: 'brand-details',
  },
  {
    label: 'Social Media',
    value: 'social-media',
  },
  {
    label: 'Collaboration Preferences',
    value: 'collaboration-preferences',
  },
];

const INDUSTRY_OPTIONS = [
  { label: 'Fashion', value: 'Fashion' },
  { label: 'Beauty', value: 'Beauty' },
  { label: 'Food & Beverage', value: 'Food & Beverage' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Home & Lifestyle', value: 'Home & Lifestyle' },
  { label: 'Health & Wellness', value: 'Health & Wellness' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Entertainment', value: 'Entertainment' },
];

const COMPANY_SIZE_OPTIONS = [
  { label: 'Startup (1-10)', value: 'Startup' },
  { label: 'Small (11-50)', value: 'Small' },
  { label: 'Medium (51-200)', value: 'Medium' },
  { label: 'Large (201-1000)', value: 'Large' },
  { label: 'Enterprise (1000+)', value: 'Enterprise' },
];

const COLLABORATION_TYPE_OPTIONS = [
  { label: 'Product Gifting', value: 'Product Gifting' },
  { label: 'Paid Promotion', value: 'Paid Promotion' },
  { label: 'Brand Ambassador', value: 'Brand Ambassador' },
  { label: 'Affiliate Marketing', value: 'Affiliate Marketing' },
  { label: 'Event Invitations', value: 'Event Invitations' },
];

export default function BrandProfilePage() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].value);
  const router = useRouter();
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const tabsViews = {
    profile: <Profile />,
    'brand-details': <BrandDetails />,
    'social-media': <SocialMedias />,
    'collaboration-preferences': <CollaborationPreferences />,
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      // @ts-ignore
      const userId = session?.user?._id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await deleteBrandAccount(userId);

      if (response.success) {
        // Sign out and redirect to login page
        await signOut({ redirect: false });
        router.push('/auth/login');
      } else {
        throw new Error(response.message || 'Failed to delete account');
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setDeleteError(
        error.message || 'An error occurred while deleting your account'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='w-full max-w-full overflow-hidden dark:bg-gray-900'>
      <h1 className='text-xl text-brand-primary sm:text-2xl text-[#404040] dark:text-gray-100 font-bold px-2 sm:px-0'>
        Brand Profile
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
            <button
              className='bg-red-500 text-white px-4 py-2 rounded w-full text-sm dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 transition-colors'
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
            {deleteError && (
              <p className='text-xs text-red-500 mt-1'>{deleteError}</p>
            )}
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
  website: string;
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
    website: '',
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
        website: profile.website || '',
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

      if (selectedFile) {
        const formData = new FormData();
        formData.append('profilePicture', selectedFile);

        Object.entries(data).forEach(([key, value]) => {
          if (value === null || value === undefined) return;

          if (key === 'address') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        });

        const response = await updateBrandProfile(userId, formData);
        console.log('response', response);

        // Update the session with the new profile data
        if (response.data) {
          const updatedUserData = response.data;
          await update({
            ...session,
            user: {
              ...session?.user,
              name: updatedUserData.name,
              username: updatedUserData.username,
              profilePicture: updatedUserData.profilePicture,
              phone: updatedUserData.phone,
              secondPhone: updatedUserData.secondPhone,
              website: updatedUserData.website,
              address: updatedUserData.address,
            },
          });
        } else {
          await update();
        }
      } else {
        const response = await updateBrandProfile(userId, data);

        // Update the session with the new profile data
        if (response.data) {
          const updatedUserData = response.data;
          await update({
            ...session,
            user: {
              ...session?.user,
              name: updatedUserData.name,
              username: updatedUserData.username,
              phone: updatedUserData.phone,
              secondPhone: updatedUserData.secondPhone,
              website: updatedUserData.website,
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
      const response = await getBrandProfile(userId);
      const profileData = response.data;

      setProfile(profileData);

      setInformations({
        name: profileData?.name || '',
        username: profileData?.username || '',
        email: profileData?.email || '',
        phone: profileData?.phone || '',
        secondPhone: profileData?.secondPhone || '',
        website: profileData?.website || '',
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
              alt='Company Logo'
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
            Company Information
          </h3>
          <div className='flex flex-wrap w-full gap-3 p-3'>
            <Input
              label='Company Name'
              placeholder='Company Name'
              value={informations.name}
              onChange={handleInputChange('name')}
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[48%]' }}
            />
            <Input
              label='Brand Handle'
              placeholder='Brand Handle'
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
              placeholder='+1 (555) 123-4567'
              value={informations.phone}
              onChange={handleInputChange('phone')}
              type='phone'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[48%]' }}
            />
            <Input
              label='Alternative Phone'
              placeholder='+1 (555) 987-6543'
              value={informations.secondPhone}
              onChange={handleInputChange('secondPhone')}
              type='phone'
              isDisabled={isDisabled}
              className={{ container: 'w-full sm:w-[48%]' }}
            />
            <Input
              label='Website'
              placeholder='https://www.yourbrand.com'
              value={informations.website}
              onChange={handleInputChange('website')}
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full' }}
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

function BrandDetails() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [newPortfolioImage, setNewPortfolioImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [brandData, setBrandData] = useState({
    primaryIndustry: null as { label: string; value: string } | null,
    secondaryIndustries: [] as Array<{ label: string; value: string }>,
    companySize: null as { label: string; value: string } | null,
    description: '',
    brandTone: '',
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
      setBrandData({
        primaryIndustry:
          INDUSTRY_OPTIONS.find(
            (industry) => industry.value === profile.primaryNiche
          ) ?? null,
        secondaryIndustries: Array.isArray(profile.secondaryNiches)
          ? profile.secondaryNiches.map((industry: string) => ({
              label: industry,
              value: industry,
            }))
          : [],
        companySize:
          COMPANY_SIZE_OPTIONS.find((size) => size.value === profile.field) ??
          null,
        description: profile.description || '',
        brandTone: profile.brandTone || '',
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
      const data: any = { ...brandData };

      data.primaryNiche = data.primaryIndustry?.value || null;
      data.secondaryNiches = data.secondaryIndustries.map(
        (industry: any) => industry.value
      );
      data.field = data.companySize?.value || null;

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

        await updateBrandProfile(userId, formData);
      } else {
        await updateBrandProfile(userId, data);
      }

      await update();
      setIsEditing(false);
      setNewPortfolioImage(null);

      // Clear preview URLs after saving
      fetchProfile();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile');
      console.error('Error updating brand details:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await getBrandProfile(userId);
      const profileData = response.data;

      setProfile(profileData);
      setBrandData({
        primaryIndustry:
          INDUSTRY_OPTIONS.find(
            (industry) => industry.value === profileData.primaryNiche
          ) ?? null,
        secondaryIndustries: Array.isArray(profileData?.secondaryNiches)
          ? profileData.secondaryNiches.map((industry: string) => ({
              label: industry,
              value: industry,
            }))
          : [],
        companySize:
          COMPANY_SIZE_OPTIONS.find(
            (size) => size.value === profileData.field
          ) ?? null,
        description: profileData?.description || '',
        brandTone: profileData?.brandTone || '',
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
          Brand Details
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
              options={INDUSTRY_OPTIONS}
              setValue={(value) =>
                setBrandData((prev) => ({ ...prev, primaryIndustry: value }))
              }
              label='Primary Industry'
              value={brandData.primaryIndustry}
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
                setBrandData((prev) => ({
                  ...prev,
                  secondaryIndustries: value,
                }))
              }
              label='Secondary Industries'
              value={brandData.secondaryIndustries}
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

            <Select
              options={COMPANY_SIZE_OPTIONS}
              setValue={(value) =>
                setBrandData((prev) => ({ ...prev, companySize: value }))
              }
              label='Company Size'
              value={brandData.companySize}
              isDisabled={isDisabled}
              styles={{
                control: {
                  border: '1px solid #d1d5db !important',
                },
              }}
              className={{
                container: 'w-full',
              }}
            />

            <div className='w-full'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Brand Description
              </label>
              <textarea
                className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                rows={4}
                value={brandData.description}
                onChange={(e) =>
                  setBrandData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={isDisabled}
                placeholder='Describe your brand and what makes it unique...'
              />
            </div>

            <Input
              label='Brand Tone'
              placeholder='Professional, Friendly, Playful, Luxurious, etc.'
              value={brandData.brandTone}
              onChange={(e) =>
                setBrandData((prev) => ({
                  ...prev,
                  brandTone: e.target.value,
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
            Brand Portfolio
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
                      setBrandData((prev) => ({
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

function CollaborationPreferences() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [collaborationData, setCollaborationData] = useState({
    collaborationType: null as { label: string; value: string } | null,
    preferredIndustry: null as { label: string; value: string } | null,
    budget: '',
    availability: '',
    previousCollaborations: '',
  });

  const isDisabled = !isEditing;

  // @ts-ignore
  const userId = user?._id;

  function cancelEditing() {
    if (profile) {
      setCollaborationData({
        collaborationType:
          COLLABORATION_TYPE_OPTIONS.find(
            (type) => type.value === profile.collaborationType
          ) ?? null,
        preferredIndustry:
          INDUSTRY_OPTIONS.find(
            (industry) => industry.value === profile.preferredIndustry
          ) ?? null,
        budget: profile.minimumRates?.perReel?.[0] || '',
        availability: profile.availability || '',
        previousCollaborations: profile.previousCollaborations || '',
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
        collaborationType: collaborationData.collaborationType?.value || null,
        preferredIndustry: collaborationData.preferredIndustry?.value || null,
        minimumRates: {
          perReel: [collaborationData.budget, ''],
        },
        availability: collaborationData.availability,
        previousCollaborations: collaborationData.previousCollaborations,
      };

      await updateBrandProfile(userId, data);
      await update();
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to update collaboration preferences'
      );
      console.error('Error updating collaboration preferences:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await getBrandProfile(userId);
      const profileData = response.data;

      setProfile(profileData);
      setCollaborationData({
        collaborationType:
          COLLABORATION_TYPE_OPTIONS.find(
            (type) => type.value === profileData.collaborationType
          ) ?? null,
        preferredIndustry:
          INDUSTRY_OPTIONS.find(
            (industry) => industry.value === profileData.preferredIndustry
          ) ?? null,
        budget: profileData?.minimumRates?.perReel?.[0] || '',
        availability: profileData?.availability || '',
        previousCollaborations: profileData?.previousCollaborations || '',
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

  return (
    <div
      className={`w-full h-full flex flex-col gap-2 ${
        isEditing ? 'justify-between' : ''
      }`}
    >
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border border-brand-primary_10 rounded-lg px-2 py-3 dark:bg-gray-800 dark:border-gray-700'>
        <h3 className='text-md text-brand-primary font-semibold dark:text-brand-primary'>
          Collaboration Preferences
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
          <div className='flex flex-wrap w-full gap-3 p-3'>
            <Select
              options={COLLABORATION_TYPE_OPTIONS}
              setValue={(value) =>
                setCollaborationData((prev) => ({
                  ...prev,
                  collaborationType: value,
                }))
              }
              label='Preferred Collaboration Type'
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
              label='Target Industry for Influencers'
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

            <Input
              label='Average Campaign Budget'
              placeholder='$1000-$5000'
              value={collaborationData.budget}
              onChange={(e) =>
                setCollaborationData((prev) => ({
                  ...prev,
                  budget: e.target.value,
                }))
              }
              type='text'
              isDisabled={isDisabled}
              className={{ container: 'w-full' }}
            />

            <Input
              label='Availability for Campaigns'
              placeholder='Ongoing, Q2 2025, etc.'
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

            <div className='w-full'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Previous Collaborations
              </label>
              <textarea
                className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                rows={4}
                value={collaborationData.previousCollaborations}
                onChange={(e) =>
                  setCollaborationData((prev) => ({
                    ...prev,
                    previousCollaborations: e.target.value,
                  }))
                }
                disabled={isDisabled}
                placeholder='List your previous influencer collaborations...'
              />
            </div>
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
