'use client';
import LinkInstagram from '@/components/LinkInstagram';
import LinkTiktok from '@/components/LinkTiktok';
import LinkYoutube from '@/components/LinkYoutube';
import Logout from '@/components/logout';
import { api } from '@/utils/axiosInstance';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
export const dynamic = 'force-dynamic';
export default function DashboardPage() {
  const { data: session } = useSession();
  console.log('session', session);
  const [instagramAccounts, setInstagramAccounts] = useState<any>(null);
  const [tiktokAccounts, setTiktokAccounts] = useState<any>(null);
  const [youtubeAccounts, setYoutubeMetrics] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get('/user/instagram/metrics');
        setInstagramAccounts(data.data);
        const res = await api.get('/user/tiktok/metrics');
        setTiktokAccounts(res.data.data);
        const res2 = await api.get('/user/youtube/metrics');
        setYoutubeMetrics(res2.data.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      Welcome, {session?.user?.name}! <br />
      <br />
      <br />
      <Logout />
      <br />
      <br />
      <br />
      <LinkYoutube />
      <br />
      <br />
      <br />
      <LinkInstagram />
      <div className='mt-5'>
        {instagramAccounts ? (
          <div className='grid  grid-cols-3 gap-5'>
            {instagramAccounts.map((acc: any, index: number) => (
              <div key={index} className='border rounded p-1'>
                username:{acc.username} <br />
                followers:{acc.followers} <br />
              </div>
            ))}
          </div>
        ) : (
          <p>you dont have any instagram account linked currently</p>
        )}
      </div>
      <LinkTiktok />
      <div className='mt-5'>
        {tiktokAccounts ? (
          <div className='grid  grid-cols-3 gap-5'>
            {tiktokAccounts.map((acc: any, index: number) => (
              <div key={index} className='border rounded p-1'>
                username:{acc.username} <br />
                followers:{acc.followers} <br />
              </div>
            ))}
          </div>
        ) : (
          <p>you dont have any Tiktol account linked currently</p>
        )}
      </div>
      <div className='mt-5'>
        {youtubeAccounts ? (
          <div className='grid  grid-cols-3 gap-5'>
            {youtubeAccounts.map((acc: any, index: number) => (
              <div key={index} className='border rounded p-1'>
                username:{acc.username} <br />
                followers:{acc.followers} <br />
              </div>
            ))}
          </div>
        ) : (
          <p>you dont have any Youtube account linked currently</p>
        )}
      </div>
      {/* <LinkYoutube />
       <div className='mt-5'>
        {tiktokAccounts ? (
          <div className='grid  grid-cols-3 gap-5'>
            {tiktokAccounts.map((acc: any, index: number) => (
              <div key={index} className='border rounded p-1'>
                username:{acc.username} <br />
                followers:{acc.followers} <br />
              </div>
            ))}
          </div>
        ) : (
          <p>you dont have any Tiktol account linked currently</p>
        )}
      </div> */}
    </div>
  );
}
