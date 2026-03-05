import Image from 'next/image';
import eyelinerwoman from '@/assets/landing/influencer-woman-eyeliner.png';
import landingIntro from '@/assets/landing/landing-intro.png';
import inluencerRecording from '@/assets/landing/inluencer-recording.png';
import Button from '@/components/ui/button';
import Link from 'next/link';
import { VisitorNavbar } from '@/components/Navbar';
import Logout from '@/components/logout';

export default function Home() {
  return (
    <main className=''>
      <VisitorNavbar />
      {/* Hero Section */}
      <section
        id='#'
        className='text-white pt-[15vh]  influencer-landing-gradient  shadow-lg px-5 md:px-20 w-full rounded-b-[5%] flex flex-col md:flex-row items-center md:items-start  justify-between min-h-screen '
      >
        <div className=' space-y-5 w-full'>
          <h1
            className='text-2xl tracking-wide md:text-8xl font-bold  md:tracking-widest
'
          >
            turn creators into revenue
          </h1>
          <p className='text-lg font-semibold md:w-[40%]'>
            Influencer marketing, affiliate programs, creator management, user
            generated content, brand ambassadors: build valuable partnerships to
            grow your business
          </p>
          <Link href='/auth/signup' className='block'>
            <Button className='influencer-primary-gradient tracking-wide px-7'>
              Get Started
            </Button>
            {/* <Logout /> */}
          </Link>
        </div>
        <Image
          src={eyelinerwoman}
          alt='influencer'
          className='flipx   w-[50%] md:w-[30%]  md:absolute right-16 bottom-0'
        />
      </section>
      {/* Platform Overview */}
      <section className='mx-auto p-6 w-[95%] md:w-[75%] bg-white dark:bg-gray-800 shadow-lg rounded-lg -translate-y-10 md:-translate-y-20'>
        <Image src={landingIntro} alt='intro' />
      </section>{' '}
      {/* Features Section */}
      <section
        id='features'
        className='py-16 px-5 md:px-20 bg-gray-50 dark:bg-gray-900'
      >
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4'>
              Everything You Need to Scale
            </h2>
            <p className='text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
              From finding the perfect creators to tracking campaign
              performance, our platform provides all the tools you need for
              successful influencer marketing
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
              <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4'>
                <svg
                  className='w-6 h-6 text-purple-600 dark:text-purple-300'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'></path>
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-2'>
                Creator Discovery
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Find the perfect influencers for your brand with our advanced
                search and filtering system
              </p>
            </div>

            <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
              <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4'>
                <svg
                  className='w-6 h-6 text-blue-600 dark:text-blue-300'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z'></path>
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-2'>
                Campaign Management
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Create, manage, and track your influencer campaigns from a
                single dashboard
              </p>
            </div>

            <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
              <div className='w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4'>
                <svg
                  className='w-6 h-6 text-green-600 dark:text-green-300'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z'></path>
                  <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z'></path>
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-2'>
                Real-time Analytics
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Track performance metrics and ROI with detailed analytics and
                reporting tools
              </p>
            </div>
          </div>
        </div>
      </section>{' '}
      {/* How It Works Section */}
      <section
        id='how-it-works'
        className='py-16 px-5 md:px-20 bg-white dark:bg-gray-800'
      >
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4'>
              How It Works
            </h2>
            <p className='text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
              Get started with influencer marketing in just a few simple steps
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl font-bold text-pink-600 dark:text-pink-300'>
                  1
                </span>
              </div>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-2'>
                Create Account
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Sign up as a brand or influencer and complete your profile
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl font-bold text-orange-600 dark:text-orange-300'>
                  2
                </span>
              </div>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-2'>
                Browse & Connect
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Find perfect matches and start building relationships
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl font-bold text-purple-600 dark:text-purple-300'>
                  3
                </span>
              </div>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-2'>
                Launch Campaigns
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Create campaigns and collaborate on amazing content
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl font-bold text-green-600 dark:text-green-300'>
                  4
                </span>
              </div>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-2'>
                Track Results
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Monitor performance and measure your success
              </p>
            </div>
          </div>
        </div>
      </section>{' '}
      {/* Content Creator Section */}
      <section
        id='creators'
        className='py-16 px-5 md:px-20 bg-gray-50 dark:bg-gray-900'
      >
        <div className='max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12'>
          <div className='flex-1'>
            <Image
              src={inluencerRecording}
              alt='influencer recording'
              className='w-full max-w-2xl mx-auto'
            />
          </div>
          <div className='flex-1 space-y-6'>
            <h2 className='text-3xl md:text-5xl font-bold text-gray-800 dark:text-white'>
              For Content Creators
            </h2>
            <p className='text-lg text-gray-600 dark:text-gray-300'>
              Turn your passion into profit. Connect with brands that align with
              your values and start earning from your content.
            </p>
            <ul className='space-y-3'>
              <li className='flex items-center text-gray-700 dark:text-gray-300'>
                <span className='w-2 h-2 bg-pink-500 rounded-full mr-3'></span>
                Monetize your social media presence
              </li>
              <li className='flex items-center text-gray-700 dark:text-gray-300'>
                <span className='w-2 h-2 bg-pink-500 rounded-full mr-3'></span>
                Access exclusive brand partnerships
              </li>
              <li className='flex items-center text-gray-700 dark:text-gray-300'>
                <span className='w-2 h-2 bg-pink-500 rounded-full mr-3'></span>
                AI-powered content generation tools
              </li>
              <li className='flex items-center text-gray-700 dark:text-gray-300'>
                <span className='w-2 h-2 bg-pink-500 rounded-full mr-3'></span>
                Track your performance analytics
              </li>
            </ul>
            <Link href='/auth/signup'>
              <Button className='influencer-primary-gradient text-white px-6 py-3'>
                Start Creating
              </Button>
            </Link>
          </div>
        </div>
      </section>{' '}
      {/* Benefits Section */}
      <section
        id='benefits'
        className='py-16 px-5 md:px-20 bg-white dark:bg-gray-800'
      >
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4'>
              Why Choose Our Platform?
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
            <div className='space-y-8'>
              <div className='flex items-start space-x-4'>
                <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0'>
                  <svg
                    className='w-4 h-4 text-blue-600 dark:text-blue-300'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-2'>
                    Advanced Matching Algorithm
                  </h3>
                  <p className='text-gray-600 dark:text-gray-300'>
                    Our AI-powered system connects brands with the most relevant
                    influencers based on audience demographics and engagement
                    rates.
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0'>
                  <svg
                    className='w-4 h-4 text-green-600 dark:text-green-300'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-2'>
                    Secure Payment System
                  </h3>
                  <p className='text-gray-600 dark:text-gray-300'>
                    Safe and secure transactions with built-in escrow protection
                    for both brands and creators.
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0'>
                  <svg
                    className='w-4 h-4 text-purple-600 dark:text-purple-300'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-2'>
                    24/7 Support
                  </h3>
                  <p className='text-gray-600 dark:text-gray-300'>
                    Get help whenever you need it with our dedicated support
                    team available around the clock.
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-8 rounded-2xl'>
              <div className='text-center'>
                <h3 className='text-2xl font-bold text-gray-800 dark:text-white mb-4'>
                  Ready to get started?
                </h3>
                <p className='text-gray-600 dark:text-gray-300 mb-6'>
                  Join thousands of brands and creators already using our
                  platform
                </p>
                <div className='space-y-3'>
                  <Link href='/auth/signup' className='block'>
                    <Button className='w-full influencer-primary-gradient text-white py-3'>
                      Sign Up for Free
                    </Button>
                  </Link>
                  <Link href='/auth/signin' className='block'>
                    <Button
                      user='brand'
                      variant='outlined'
                      className='w-full py-3'
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>{' '}
      {/* Stats Section */}
      <section
        id='stats'
        className='py-16 px-5 md:px-20 bg-gray-900 text-white'
      >
        <div className='max-w-6xl mx-auto'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
            <div>
              <h3 className='text-3xl md:text-4xl font-bold mb-2'>10K+</h3>
              <p className='text-gray-300'>Active Creators</p>
            </div>
            <div>
              <h3 className='text-3xl md:text-4xl font-bold mb-2'>500+</h3>
              <p className='text-gray-300'>Brands Partnered</p>
            </div>
            <div>
              <h3 className='text-3xl md:text-4xl font-bold mb-2'>1M+</h3>
              <p className='text-gray-300'>Campaigns Launched</p>
            </div>
            <div>
              <h3 className='text-3xl md:text-4xl font-bold mb-2'>$5M+</h3>
              <p className='text-gray-300'>Creator Earnings</p>
            </div>
          </div>
        </div>
      </section>
      {/* Final CTA Section */}
      <section className='py-16 px-5 md:px-20 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-center'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-3xl md:text-5xl font-bold mb-6'>
            Start Your Influencer Marketing Journey Today
          </h2>
          <p className='text-xl mb-8 opacity-90'>
            Whether you're a brand looking to grow or a creator ready to
            monetize, we have the tools you need to succeed.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/auth/signup'>
              <Button className=' text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold'>
                Get Started Free
              </Button>
            </Link>
            <Link href='/contact'>
              <Button
                variant='outlined'
                className='border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg font-semibold'
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <footer className='w-full h-5 md:h-10 influencer-primary-gradient '></footer>
    </main>
  );
}
