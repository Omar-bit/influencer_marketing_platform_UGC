import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProviders from '@/providers/AppProviders';
import Toast from '@/components/shared/Toast';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Influencer Platform',
  description: 'Influencer Platform',
};

export default function RootLayout({
  children,
  session,
}: Readonly<{
  children: React.ReactNode;
  session: any;
}>) {
  return (
    <html lang='en'>
      <body className={`${inter.className} antialiased`}>
        <AppProviders session={session}>
          <main className='w-full overflow-x-hidden scroll-bar-fix'>
            {children}
          </main>
          <Toast />
        </AppProviders>
      </body>
    </html>
  );
}
