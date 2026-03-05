'use client';

import { BACKEND_URL } from '@/utils/secrets';
import { useSession } from 'next-auth/react';

function LinkInstagram() {
  const { data: auth } = useSession();

  function linkInsta() {
    //@ts-ignore
    window.location.href = `${BACKEND_URL}/api/user/instagram?token=${auth.accessToken}`;
  }
  return (
    <button
      className='hover:bg-opacity-[0.2]'
      style={{
        background: 'linear-gradient(to left,#f9ce34,#ee2a7b 8%,  #6228d7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '10px',
        border: '#ee2a7b solid 2px',
      }}
      onClick={linkInsta}
    >
      Link Instagram
    </button>
  );
}

export default LinkInstagram;
