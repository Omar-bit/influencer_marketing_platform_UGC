'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './themeContext';
import { SocketProvider } from './SocketProvider';
import { NotificationProvider } from './NotificationProvider';

export default function AppProviders({
  children,
  session,
}: Readonly<{ children: React.ReactNode; session: any }>) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <SocketProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </SocketProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
