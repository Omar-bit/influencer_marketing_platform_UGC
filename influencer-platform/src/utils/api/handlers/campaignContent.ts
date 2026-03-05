import { api } from '@/utils/axiosInstance';
import { BACKEND_URL } from '@/utils/secrets';

export const submitCampaignContent = async (
  campaignId: string,
  formData: FormData
) => {
  const response = await api.post(`/campaign-content/${campaignId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getCampaignContents = async (
  campaignId: string,
  options?: {
    status?: string;
  }
) => {
  const queryParams = new URLSearchParams();
  if (options?.status) {
    queryParams.append('status', options.status);
  }

  const url = `/campaign-content/campaign/${campaignId}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;
  const response = await api.get(url);
  return response.data;
};

export const getCampaignContent = async (contentId: string) => {
  const response = await api.get(`/campaign-content/${contentId}`);
  return response.data;
};

export const deleteCampaignContent = async (contentId: string) => {
  const response = await api.delete(`/campaign-content/${contentId}`);
  return response.data;
};

export const updateContentStatus = async (
  contentId: string,
  status: 'rejected' | 'accepted',
  reason?: string | null
) => {
  const response = await api.put(
    `/campaign-content/status/${contentId}`,

    {
      status,
      reason,
    }
  );
  return response.data;
};

// Get all campaign contents for all campaigns (for the authenticated user based on their role)
export const getAllCampaignContents = async () => {
  try {
    const response = await api.get(`${BACKEND_URL}/api/campaign-content/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all campaign contents:', error);
    throw error;
  }
};

export async function payContent(contentId: string, reqData: any) {
  const { data } = await api.post(
    `${BACKEND_URL}/api/campaign-content/${contentId}/payment`,
    reqData
  );
  return data;
}
