import { AuthNavbar } from '@/components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Influencer Platform',
  description: 'Influencer Platform',
};

export default function BrandLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex items-stretch min-h-screen max-w-full overflow-x-hidden'>
      <AuthNavbar />
      <main className='flex-1 flex flex-col lg:ml-[17%] '>
        {/* <LayoutHeader /> */}
        <div className='flex-1 overflow-y-auto p-2 '>{children}</div>
      </main>
    </div>
  );
}
