'use client';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
export default function SessionContext({
  children,
  session,
}: Readonly<{ children: React.ReactNode; session: any }>) {
  return (
    <SessionProvider session={session}>
      <SessionChecker />
      {children}
    </SessionProvider>
  );
}

function SessionChecker() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'unauthenticated') {
      // If the user is unauthenticated, sign them out
      router.push('/auth/login');

      signOut({
        callbackUrl: '/auth/login',
      });
      //redirect to login page
    }
  }, [status]);
  return null;
}
