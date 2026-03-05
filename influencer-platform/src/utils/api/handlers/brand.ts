import { api } from '@/utils/axiosInstance';
import { AxiosResponse } from 'axios';

/**
 * Get brand profile information
 * @param id User ID
 * @returns Promise with brand profile data
 */
export const getBrandProfile = (id: string): Promise<any> => {
  return api.get(`/brand/${id}`).then((response: AxiosResponse) => {
    return response.data;
  });
};

export const getBrandRemainingCampaigns = (): Promise<any> => {
  return api
    .get(`/brand/remainingCampaigns`)
    .then((response: AxiosResponse) => {
      return response.data;
    });
};

/**
 * Update brand profile information
 * @param id User ID
 * @param data Brand profile data to update
 * @returns Promise with updated brand profile data
 */
export const updateBrandProfile = (id: string, data: any): Promise<any> => {
  // Handle both FormData and JSON data
  const contentType =
    data instanceof FormData ? {} : { 'Content-Type': 'application/json' };

  return api
    .put(`/brand/${id}`, data, {
      headers: {
        ...contentType,
      },
    })
    .then((response: AxiosResponse) => {
      return response.data;
    });
};

/**
 * Delete brand account
 * @param id User ID
 * @returns Promise with success message
 */
export const deleteBrandAccount = (id: string): Promise<any> => {
  return api.delete(`/brand/${id}`).then((response: AxiosResponse) => {
    return response.data;
  });
};
