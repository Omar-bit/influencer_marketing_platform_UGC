import { refreshAccessToken } from '@/utils/auth';
import { api_ssr } from '@/utils/axiosInstance';
import { BACKEND_URL, SECRET } from '@/utils/secrets';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const { data } = await res.json();

        if (res && res.ok) return data;
        if (res.status === 403) {
          throw new Error('banned user');
        }
        if (res.status === 401) {
          throw new Error('unverified user');
        }
        throw new Error('Invalid credentials');
      },
    }),
    CredentialsProvider({
      name: 'Providers',
      id: 'providers',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        passKey: { label: 'Pass Key', type: 'password' },
      },
      // @ts-ignore
      async authorize(credentials: any) {
        try {
          const { data } = await api_ssr.post(
            `/auth/login/providers`,
            credentials,
            {
              withCredentials: true,
            }
          );

          return data.data;
        } catch (e: any) {
          console.log('Providers Login Error: ', e.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user: data, trigger, session }: any) {
      if (!token && !data) {
        return null;
      }
      if (trigger === 'update') {
        return { ...token, ...data, ...session };
      }

      // On initial sign in, store the refresh token
      if (data) {
        token.accessToken = data.accessToken;
        token.refreshToken = data.refreshToken;
        token.accessTokenExpires = data.accessTokenExpires;
        token.user = data.user;
        return token;
      }

      // Check if we have required token data
      if (
        !token.accessToken ||
        !token.refreshToken ||
        !token.accessTokenExpires
      ) {
        console.log('Missing required token data, redirecting to login');
        return null; // This will force redirect to sign-in page
      }

      // Check if access token should be refreshed
      const shouldRefresh = Date.now() > token.accessTokenExpires;
      if (shouldRefresh && token.refreshToken) {
        console.log('Token expired, refreshing...');

        try {
          const refreshData: {
            accessToken: string;
            refreshToken: string;
            accessTokenExpires: number;
          } | null = await refreshAccessToken(token.refreshToken);
          console.log(refreshData, 'refreshData');

          if (refreshData) {
            token.accessToken = refreshData.accessToken;
            token.refreshToken = refreshData.refreshToken; // Update refresh token
            token.accessTokenExpires = refreshData.accessTokenExpires;
          } else {
            console.log('Failed to refresh token, redirecting to login');
            return null; // This will force redirect to sign-in page
          }
        } catch (error) {
          console.log('Error refreshing token, redirecting to login:', error);
          return null; // This will force redirect to sign-in page
        }
      }
      return token;
    },
    async session({ session, token: data }: any) {
      // If token is null (due to refresh failure), return null to trigger redirect
      if (!data) {
        return null;
      }
      return { ...session, ...data };
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
    signOut: '/',
  },
  secret: SECRET,
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
