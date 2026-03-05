import { api } from '@/utils/axiosInstance';
import {
  GET_INFLUENCER,
  GET_INFLUENCER_INCOMES,
  GET_INFLUENCERS,
  GET_PERSONAL_PROFILE,
  UPDATE_PROFILE,
} from '../routes/influencer';

export const getInfluencers = async () => {
  const { data } = await api.get(GET_INFLUENCERS);
  return data;
};

export const getInfluencerById = async (influencerId: string) => {
  const { data } = await api.get(`${GET_INFLUENCER}${influencerId}`);
  return data;
};

export const getPersonalProfile = async (userId: string) => {
  const { data } = await api.get(`${GET_PERSONAL_PROFILE}/${userId}`);
  return data;
};

export const updateInfluencerProfile = async (userId: string, data: any) => {
  // Check if data is FormData (for file uploads)
  const headers =
    data instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : undefined;

  return await api.put(`${UPDATE_PROFILE}/${userId}`, data, { headers });
};

export const getInfluencerIncomes = async () => {
  const { data } = await api.get(GET_INFLUENCER_INCOMES);
  return data;
};
