import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
const PROTECTED_PATHS = [
  { route: '/dashboard', users: ['business', 'influencer'] },
  { route: '/brand', users: ['business'] },
  { route: '/influencer', users: ['admin', 'influencer'] },
  { route: '/users', users: ['admin', 'influencer', 'business'] },
  { route: '/campaigns', users: ['admin', 'influencer', 'business'] },
  { route: '/chat', users: ['influencer', 'business'] },
  { route: '/admin', users: ['admin'] },
  { route: '/payment', users: ['influencer', 'business'] },
];
const DEFAULT_PATHS: { business: string; influencer: string; admin: string } = {
  business: '/brand',
  influencer: '/influencer',
  admin: '/admin',
};
export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const path = PROTECTED_PATHS.find((route) =>
    nextUrl.pathname.startsWith(route.route)
  );
  const isProtected = !!path;
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  // console.log('session', session);

  const isAuthenticated = !!session?.user;
  //@ts-ignore
  const userType: 'business' | 'influencer' | 'admin' = session?.user?.type;
  if (isProtected && !isAuthenticated) {
    const redirectUrl = new URL('/auth/login', request.url);

    redirectUrl.search = nextUrl.search;

    return NextResponse.redirect(redirectUrl);
  }
  if (isAuthenticated && nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = new URL(`${DEFAULT_PATHS[userType]}`, request.url);
    redirectUrl.search = nextUrl.search;

    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated && isProtected && !path?.users.includes(userType)) {
    const redirectUrl = new URL(`${DEFAULT_PATHS[userType]}`, request.url);
    redirectUrl.search = nextUrl.search;

    return NextResponse.redirect(redirectUrl);
  }
  if (nextUrl.pathname === '/dashboard') {
    //redirect to defailt path
    const redirectUrl = new URL(`${DEFAULT_PATHS[userType]}`, request.url);
    redirectUrl.search = nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }
  NextResponse.next();
}
export const config = {
  unstable_allowDynamic: ['**/node_modules/**'],
};
