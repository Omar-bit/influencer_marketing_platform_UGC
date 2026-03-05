import * as userRoutes from '../routes/user';
import { api } from '@/utils/axiosInstance';

export async function getSocialMediaMetrics() {
  const { data } = await api.get(userRoutes.GET_SOCIALMEDIA_METRICS);
  return data;
}

export async function getUserById(id: string) {
  const { data } = await api.get(`${userRoutes.GET_USER_BY_ID}/${id}`);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get(userRoutes.ME());
  return data;
}
