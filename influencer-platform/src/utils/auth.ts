import { signOut, getSession } from 'next-auth/react';
import { BACKEND_URL } from './secrets';
import { api, api_ssr } from './axiosInstance';
import { LOGOUT } from './api/routes/auth';
import axios from 'axios';

export async function logout(refreshToken?: string) {
  try {
    if (refreshToken) {
      await api.post(LOGOUT, { refreshToken }, { withCredentials: true });
    }
    signOut();
  } catch (err) {
    console.error(err);
    // Still sign out from NextAuth even if the server logout fails
    signOut();
  }
}

// Helper function to logout with the current session's refresh token
export async function logoutWithSession() {
  try {
    const session = await getSession();
    // @ts-ignore - refreshToken exists on our custom session
    const refreshToken = session?.refreshToken;
    await logout(refreshToken);
  } catch (err) {
    console.error(err);
    // Fallback to simple logout
    signOut();
  }
}
export async function refreshAccessToken(
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
} | null> {
  console.log('refreshing token');
  try {
    const res = await axios.post(
      `${BACKEND_URL}/api/auth/refresh`,
      {
        refreshToken: refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (res.status === 200) {
      return res.data.data;
    }
  } catch (err) {
    console.error('refresh error', err);
    return null;
  }
  return null;
}
export const signinWithProvider = (provider: 'google' | 'facebook') => {
  window.open(`${BACKEND_URL}/api/auth/${provider}`, '_self');
};
