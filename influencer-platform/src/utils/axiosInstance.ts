import axios from 'axios';
import { BACKEND_URL } from './secrets';
import { getSession } from 'next-auth/react';

export const api_ssr = axios.create({
  baseURL: BACKEND_URL + '/api',
  withCredentials: true,
});

export const public_api = axios.create({
  baseURL: BACKEND_URL + '/api',
  withCredentials: true,
});
export const api = axios.create({
  baseURL: BACKEND_URL + '/api',
  withCredentials: true,
});
api.interceptors.request.use(async (config) => {
  const session = await getSession();

  // Modify the request config before sending
  //@ts-ignore
  config.headers['Authorization'] = `Bearer ${session?.accessToken}`;
  return config;
});
