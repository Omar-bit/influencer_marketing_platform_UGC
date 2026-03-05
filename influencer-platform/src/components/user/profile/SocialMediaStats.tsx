import { FaFacebook, FaTiktok } from 'react-icons/fa';
import { FaChild } from 'react-icons/fa';
import { IoLogoYoutube } from 'react-icons/io';
import { LuInstagram } from 'react-icons/lu';
import { useState } from 'react';
import Button from '../../ui/button';
import FakeFollowersAnalysisModal from '../../modals/FakeFollowersAnalysisModal';

export interface ISocialMediaStats {
  platform: string;
  followers: number;
  username?: string;
  engagementRate?: number;
  conversionPercentage?: number;
}

const socialMediaStats = [
  {
    platform: 'facebook',
    icon: <FaFacebook className='text-blue-700' size={20} />,
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    progressColor: 'bg-blue-600',
  },
  {
    platform: 'instagram',
    icon: <LuInstagram className=' text-influencer-primary' size={20} />,
    color: 'influencer-primary-gradient',
    textColor: 'text-pink-600',
    progressColor: 'bg-pink-600',
  },
  {
    platform: 'tiktok',
    icon: <FaTiktok className='text-black' size={20} />,
    color: 'bg-black',
    textColor: 'text-black',
    progressColor: 'bg-black',
  },
  {
    platform: 'youtube',
    icon: <IoLogoYoutube className='text-red-600' size={20} />,
    color: 'bg-red-600',
    textColor: 'text-red-600',
    progressColor: 'bg-red-600',
  },
];

function SocialMediaStats({
  socialMedia,
}: {
  socialMedia: ISocialMediaStats[];
}) {
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedInstagramAccount, setSelectedInstagramAccount] =
    useState<ISocialMediaStats | null>(null);

  const getSocialMediaStats = (platform: string) => {
    const account = socialMedia.find(
      (acc) => acc.platform.toLowerCase() === platform.toLowerCase()
    );
    return {
      followers: account ? account.followers.toLocaleString() : '0',
      engagementRate: account?.engagementRate || 0,
      conversionPercentage: account?.conversionPercentage || 0,
      account: account,
    };
  };

  const handleAnalyzeFollowers = (account: ISocialMediaStats) => {
    setSelectedInstagramAccount(account);
    setIsAnalysisModalOpen(true);
  };
  return (
    <>
      <div className='flex flex-wrap gap-4 justify-center my-3 w-full sm:w-[90%] md:w-[80%] mx-auto px-4'>
        {socialMediaStats.map((social) => {
          const stats = getSocialMediaStats(social.platform);
          const isInstagram = social.platform.toLowerCase() === 'instagram';

          return (
            <div
              className='flex flex-col w-[45%] sm:w-[22%] border rounded-md shadow-sm overflow-hidden'
              key={social.platform}
            >
              <header
                className={`flex items-center  px-3 py-2 ${social.color}`}
              >
                <div className='flex items-center justify-center p-1 rounded-full bg-white '>
                  {social.icon}
                </div>
                <div className='flex flex-col items-center justify-center w-full'>
                  <div className={`text-white font-bold text-md`}>
                    {stats.followers}
                  </div>
                  <span className='text-white font-medium capitalize'>
                    {social.platform}
                  </span>
                </div>
              </header>
              <main className='flex flex-col p-2 space-y-3 text-center'>
                <div className='flex flex-col space-y-3 text-sm'>
                  <div className='space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-gray-500'>Engagement rate</span>
                      <span className='font-semibold'>
                        {stats.engagementRate}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-1.5'>
                      <div
                        className={`h-1.5 rounded-full ${social.progressColor}`}
                        style={{ width: `${stats.engagementRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-gray-500'>
                        Conversion percentage
                      </span>
                      <span className='font-semibold'>
                        {stats.conversionPercentage}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-1.5'>
                      <div
                        className={`h-1.5 rounded-full ${social.progressColor}`}
                        style={{ width: `${stats.conversionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Fake Followers Analysis Button for Instagram */}
                {isInstagram && stats.account && (
                  <div className='mt-3 pt-2 border-t border-gray-200 dark:border-gray-700'>
                    <Button
                      user='influencer'
                      variant='outlined'
                      color='gradient'
                      onClick={() => handleAnalyzeFollowers(stats.account!)}
                      className='w-full text-xs py-1.5 px-2 flex items-center justify-center gap-1'
                    >
                      <FaChild className='text-xs' />
                      <span>Analyze Followers</span>
                    </Button>
                  </div>
                )}
              </main>
            </div>
          );
        })}
      </div>

      {/* Fake Followers Analysis Modal */}
      <FakeFollowersAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        username={selectedInstagramAccount?.username}
        followers={selectedInstagramAccount?.followers}
      />
    </>
  );
}

export default SocialMediaStats;
