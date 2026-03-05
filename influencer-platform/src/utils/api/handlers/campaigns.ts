import { api } from '@/utils/axiosInstance';
import * as campaignRoutes from '../routes/campaign';

/**
 * Get campaign by ID
 */
export async function getCampaignById(campaignId: string) {
  try {
    const { data } = await api.get(
      campaignRoutes.GET_CAMPAIGN_BY_ID(campaignId)
    );
    return data;
  } catch (error: any) {
    console.error('Error getting campaign details:', error);
    return {
      success: false,
      message:
        error.response?.data?.message || 'Failed to fetch campaign details',
    };
  }
}
