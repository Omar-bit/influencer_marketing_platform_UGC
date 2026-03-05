'use client';

import { useSession } from 'next-auth/react';

import { BACKEND_URL } from '@/utils/secrets';
import { ReactNode } from 'react';
type SocialMediaLinkProps = {
  social: 'youtube' | 'tiktok' | 'instagram' | 'facebook';
  children?: ReactNode;
};
export default function SocialMediaLink({
  social,
  children,
}: SocialMediaLinkProps) {
  const { data: auth } = useSession();

  function link() {
    //@ts-ignore
    window.location.href = `${BACKEND_URL}/api/user/${social}?token=${auth.accessToken}`;
  }
  return <button onClick={link}>{children}</button>;
}
