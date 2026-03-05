'use client';
import { useSession } from 'next-auth/react';
import Logout from './logout';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/assets/logo.svg';
import { useState, ReactNode } from 'react';
import Button from './ui/button';
import { RxHamburgerMenu } from 'react-icons/rx';
import { IoChatbox, IoClose } from 'react-icons/io5';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import BrandLogo from '@/assets/logo.svg';
import InfluencerLogo from '@/assets/gradient-logo.svg';
import ThemeToggle from './ui/ThemeToggle';

import HomeLogo from '@/assets/home.svg';
import OpportunitiesLogo from '@/assets/opportunities.svg';
import NotificationIcon from '@/assets/notification.svg';
import { usePathname } from 'next/navigation';
import Seperator from './ui/Seperator';
import ProfilePicture from './shared/ProfilePicture/ProfilePicture';
import {
  FaBookmark,
  FaEnvelope,
  FaProductHunt,
  FaSpeakap,
  FaUsers,
  FaVideo,
} from 'react-icons/fa';
import NotificationCenter from './notifications/NotificationCenter';
import { LuMessageCircleWarning } from 'react-icons/lu';
import { AiFillAlert, AiFillProduct } from 'react-icons/ai';
import { CgDanger } from 'react-icons/cg';
import { MdOutlinePayment } from 'react-icons/md';
import { GiMoneyStack } from 'react-icons/gi';

// Define types for navigation links
interface SubLink {
  type: string;
  href: string;
  label: string;
}

interface NavLink {
  type: string;
  label: string;
  href?: string;
  icon: ReactNode;
  subLinks?: SubLink[];
}

const ADMIN_NAV_LINKS: NavLink[] = [
  {
    type: 'child',
    label: 'Home',
    href: '/admin',
    icon: <HomeLogo />,
  },
  {
    type: 'child',
    label: 'Users',
    href: '/admin/users',
    icon: <FaUsers className='text-brand-primary size-5' />,
  },
  {
    type: 'child',
    label: 'Campaigns',
    href: '/admin/campaigns',
    icon: <FaSpeakap className='text-brand-primary size-5' />,
  },
  {
    type: 'child',
    label: 'Incomes',
    href: '/admin/incomes',
    icon: <GiMoneyStack className='text-brand-primary size-5' />,
  },
  {
    type: 'child',
    label: 'Support Tickets',
    href: '/admin/tickets',
    icon: <LuMessageCircleWarning className='text-brand-primary size-5' />,
  },
];
const BRAND_NAV_LINKS = [
  {
    type: 'child',
    label: 'Home',
    href: '/brand',
    icon: <HomeLogo />,
  },
  {
    type: 'parent',
    label: 'Products',
    icon: <AiFillProduct className='text-brand-primary size-5' />,
    subLinks: [
      { type: 'child', href: '/brand/products', label: 'Manage' },
      { type: 'child', href: '/brand/products/sales', label: 'Sales History' },
    ],
  },
  // {
  //   type: 'child',
  //   label: 'Support',
  //   href: '/support',
  //   icon: <LuMessageCircleWarning className='text-brand-primary' />,
  // },
  {
    type: 'parent',
    label: 'Manage Influencers',
    icon: <OpportunitiesLogo />,
    subLinks: [
      { type: 'child', href: '/brand/influencers', label: 'Search' },
      {
        type: 'child',
        href: '/brand/recommendations',
        label: 'Recommendations',
      },
      // {
      //   type: 'child',
      //   href: '/brand/influencers/database',
      //   label: 'XDatabaseX',
      // },
      // { type: 'child', href: '/brand/influencers/ranking', label: 'XRankingX' },
      { type: 'child', href: '/brand/influencers/list', label: 'List' },
      {
        type: 'child',
        label: 'Inbox',
        href: '/chat',
      },
    ],
  },
  {
    icon: <OpportunitiesLogo />,
    type: 'parent',
    label: 'Manage Campaigns',
    subLinks: [
      { type: 'child', href: '/brand/campaign/create', label: 'Create' },
      { type: 'child', href: '/brand/campaign', label: 'Manage' },
      {
        type: 'child',
        href: '/brand/campaign/applications',
        label: 'Applications',
      },
      {
        type: 'child',
        href: '/campaigns/contents',
        label: 'All Contents',
      },
    ],
  },
  {
    type: 'child',
    label: 'Subscription',
    href: '/brand/subscription',
    icon: <MdOutlinePayment className='text-brand-primary' />,
  },
  {
    type: 'child',
    label: 'Support',
    href: '/support',
    icon: <LuMessageCircleWarning className='text-brand-primary' />,
  },
];
const INFLUENCER_NAV_LINKS = [
  {
    type: 'child',
    label: 'Home',
    href: '/influencer',
    icon: <HomeLogo />,
  },
  {
    type: 'child',
    label: 'Opportunities',
    href: '/influencer/opportunities',
    icon: <OpportunitiesLogo />,
  },
  {
    type: 'child',
    label: 'Invitations',
    href: '/influencer/invitations',
    icon: <FaEnvelope className='text-brand-primary' />,
  },
  {
    type: 'child',
    label: 'Bookmarks',
    href: '/influencer/campaign/bookmarks',
    icon: <FaBookmark className='text-brand-primary' />,
  },
  {
    type: 'child',
    label: 'AI Reel Generator',
    href: '/influencer/ai-reels',
    icon: <FaVideo className='text-brand-primary' />,
  },
  {
    type: 'child',
    label: 'Inbox',
    href: '/chat',
    icon: <IoChatbox className='text-brand-primary' />,
  },
  {
    type: 'child',
    label: 'My Contents',
    href: '/campaigns/contents',
    icon: <OpportunitiesLogo />,
  },
  {
    type: 'child',
    label: 'My Incomes',
    href: '/influencer/incomes',
    icon: <GiMoneyStack className='text-brand-primary' />,
  },
  {
    type: 'child',
    label: 'Support',
    href: '/support',
    icon: <LuMessageCircleWarning className='text-brand-primary' />,
  },
];
function isParentActive(path: string, parentLabel: string) {
  const parentPath = BRAND_NAV_LINKS.find((link) => link.label === parentLabel);
  const isActive = parentPath?.subLinks?.some((link) => link.href === path);
  return isActive;
}
export function AuthNavbar() {
  const { status, data } = useSession();
  const path = usePathname();
  //@ts-ignore
  const userType = data?.user?.type;
  const navRoutes =
    userType === 'business'
      ? BRAND_NAV_LINKS
      : userType === 'influencer'
      ? INFLUENCER_NAV_LINKS
      : userType === 'admin'
      ? ADMIN_NAV_LINKS
      : [];
  const NavbarLogo = userType === 'business' ? BrandLogo : InfluencerLogo;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSubmenus, setExpandedSubmenus] = useState<string[]>([]);
  //@ts-ignore
  let profilePicture = data?.user?.profilePicture;
  if (profilePicture) {
    profilePicture = `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${profilePicture}`;
  }

  const toggleSubmenu = (label: string) => {
    setExpandedSubmenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`fixed top-3 right-4 z-50 lg:hidden bg-white dark:bg-gray-800 p-2 rounded-full shadow-md`}
      >
        {mobileMenuOpen ? (
          <IoClose className='size-6' />
        ) : (
          <RxHamburgerMenu className='size-6' />
        )}
      </button>

      <nav
        className={`${
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        } 
        fixed top-0 left-0 z-40 w-64 lg:w-[17%] py-1 pl-5 space-y-2 flex flex-col justify-between 
        h-screen shadow-right overflow-y-auto bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out`}
      >
        <div>
          <NavbarLogo className='text-brand-primary mx-auto size-16' />
          {userType === 'influencer' && (
            <h3 className='text-brand-primary font-extrabold text-2xl text-center -mt-3'>
              WebTrend
            </h3>
          )}
          <div className='space-y-2 '>
            {navRoutes.map((link, index) => {
              if (link.type === 'child') {
                return (
                  <div
                    className={`flex items-center gap-2 mb-2 py-2 pl-2 ${
                      path === link.href
                        ? 'bg-brand-primary_10 text-brand-primary border-l-8 border-l-brand-primary rounded-l-md dark:bg-gray-800'
                        : ''
                    }`}
                    key={index}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.icon}
                    <Link
                      className='text-black dark:text-white font-semibold uppercase text-[14px]'
                      href={link.href as string}
                      key={link.label}
                    >
                      {link.label}
                    </Link>
                  </div>
                );
              }
              return (
                <div key={index}>
                  <header
                    className={`flex items-center justify-between gap-1 mb-[1px] py-1 pr-1 cursor-pointer ${
                      isParentActive(path, link.label)
                        ? 'bg-brand-primary_10 text-brand-primary px-2 border-l-8 border-l-brand-primary rounded-l-md text-[14px] dark:bg-gray-800'
                        : ''
                    }`}
                    onClick={() => toggleSubmenu(link.label)}
                  >
                    <div className='flex items-center gap-1'>
                      {link.icon}
                      <h3 className='text-black dark:text-white font-semibold uppercase text-[14px]'>
                        {link.label}
                      </h3>
                    </div>
                    {expandedSubmenus.includes(link.label) ? (
                      <FaChevronDown className='text-xs' />
                    ) : (
                      <FaChevronRight className='text-xs' />
                    )}
                  </header>{' '}
                  {expandedSubmenus.includes(link.label) &&
                    'subLinks' in link &&
                    link.subLinks && (
                      <div className='flex flex-col  pl-5 gap-1 mt-1'>
                        {link.subLinks.map(
                          (
                            subLink: { href: string; label: string },
                            subindex: number
                          ) => (
                            <Link
                              className={`p-1 text-sm ${
                                path === subLink.href
                                  ? ' w-full bg-brand-primary_10 font-semibold text-brand-primary dark:bg-gray-800'
                                  : ''
                              }`}
                              href={subLink.href as string}
                              key={index + ' ' + subindex}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {subLink.label}
                            </Link>
                          )
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
        <div className='w-[90%]'>
          <div className=' flex flex-col items-start justify-start gap-2'>
            {userType === 'business' && (
              <RemainingCampaigns
                //@ts-ignore
                remainingCampaigns={data?.user?.remainingCampaigns}
              />
            )}
            {userType !== 'admin' && (
              <Link
                href={`/${
                  { influencer: 'influencer', business: 'brand' }[
                    userType as 'business' | 'influencer'
                  ]
                }/profile`}
                className='text-gray-600 dark:text-gray-300 text-sm'
              >
                Your Profile
              </Link>
            )}
            {/* <p className='text-gray-600 dark:text-gray-300 text-sm'>Settings</p> */}
            <Logout />
          </div>
          <Seperator type='neutral' className='w-full my-2' />
          <div className='flex items-center justify-between gap-1'>
            <ProfilePicture
              src={profilePicture}
              alt='profile pircture'
              size='small'
            />
            <h5 className='text-gray-500 dark:text-gray-300 text-[5px] sm:text-base truncate max-w-[100px] sm:max-w-full'>
              {data?.user?.name}
            </h5>
            <div className='flex items-center gap-2 relative'>
              {/* <NotificationIcon className='size-6 scale-80' /> */}
              <NotificationCenter />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
function RemainingCampaigns({
  remainingCampaigns,
}: {
  remainingCampaigns: number;
}) {
  const icons = {
    normall: <LuMessageCircleWarning className=' text-green-500 size-3' />,
    warning: <CgDanger className=' text-yellow-500 size-3' />,
    danger: <AiFillAlert className=' text-red-500 size-3' />,
  };
  const status =
    remainingCampaigns > 5
      ? 'normall'
      : remainingCampaigns > 2
      ? 'warning'
      : 'danger';
  const icon = icons[status];
  return (
    <div className='flex items-center justify-between gap-2'>
      <div className='flex items-center gap-2'>
        {icon}
        <h5 className='text-gray-500 dark:text-gray-300 text-[3px] sm:text-base truncate max-w-[100px] sm:max-w-full'>
          {remainingCampaigns} Campaigns Left
        </h5>
      </div>
    </div>
  );
}
const VISITOR_NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#creators', label: 'For Creators' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#stats', label: 'Success Stories' },
];
export function VisitorNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className='py-10 px-12 flex justify-between md:justify-normal gap-10 items-center absolute top-0 left-0 right-0 z-50 text-white'>
      <div>
        <Logo />
      </div>
      <div
        className={`w-full md:flex items-center justify-between ${
          isOpen
            ? 'fixed top-0 left-0 h-screen flex flex-col !justify-center bg-influencer-primary dark:bg-gray-900 gap-3'
            : 'hidden'
        }`}
      >
        <div className='flex flex-col md:flex-row justify-between items-center text-white relative gap-3 md:gap-6'>
          {VISITOR_NAV_LINKS.map(({ href, label }) => (
            <Link
              className='capitalize font-bold text-xs lg:text-md'
              href={href}
              key={label}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className='flex flex-col md:flex-row gap-2 lg:gap-3 items-center w-[30%] lg:w-[45%] md:justify-end'>
          <Link className='font-bold text-xs lg:text-md' href='/auth/login'>
            <Button className='' variant='light' color='gray' user='influencer'>
              Log in
            </Button>
          </Link>
          <Link className='font-bold text-xs lg:text-md' href='/auth/signup'>
            <Button className='influencer-primary-gradient px-2 py-1 lg:px-4 lg:py-2'>
              Get Started
            </Button>
          </Link>
          <ThemeToggle />
        </div>
        <IoClose
          onClick={() => setIsOpen(false)}
          className='absolute top-5 right-5 size-8 md:hidden cursor-pointer'
        />
      </div>
      <div className='flex items-center gap-2'>
        <RxHamburgerMenu
          onClick={() => setIsOpen(true)}
          className='md:hidden size-8 cursor-pointer'
        />
        <div className='md:hidden'>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
