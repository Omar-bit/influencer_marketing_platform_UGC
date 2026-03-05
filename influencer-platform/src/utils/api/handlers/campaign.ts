import * as campaignRoutes from '../routes/campaign';
import { api } from '@/utils/axiosInstance';
export async function createCampaign(reqData: any) {
  const { data } = await api.post(campaignRoutes.CREATE_CAMPAIGN, reqData);
  return data;
}
export async function draftCampaign(reqData: any) {
  const { data } = await api.post(campaignRoutes.DRAFT_CAMPAIGN, reqData);
  return data;
}

export async function getBrandCampaigns(brand: string, reqData: any) {
  const { data } = await api.get(
    `${campaignRoutes.GET_BRAND_CAMPAIGNS}/${brand}`,
    {
      params: {
        ...reqData,
      },
    }
  );
  return data;
}

export async function getAllCampaigns() {
  const { data } = await api.get(campaignRoutes.GET_ALL_CAMPAIGNS);
  return data;
}

export async function getCampaignById(campaignId: string) {
  const { data } = await api.get(campaignRoutes.GET_CAMPAIGN_BY_ID(campaignId));
  return data;
}

export async function editCampaign(campaignId: string, reqData: any) {
  // Check if reqData is FormData, and if so convert relevant parts to JSON
  if (reqData instanceof FormData) {
    // For multipart form data, we need to use the form data directly
    const { data } = await api.put(
      campaignRoutes.EDIT_CAMPAIGN(campaignId),
      reqData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  } else {
    // For regular JSON data
    const { data } = await api.put(
      campaignRoutes.EDIT_CAMPAIGN(campaignId),
      reqData
    );
    return data;
  }
}

export async function deleteCampaign(campaignId: string) {
  const { data } = await api.delete(campaignRoutes.DELETE_CAMPAIGN(campaignId));
  return data;
}

export async function closeCampaign(campaignId: string) {
  const { data } = await api.put(campaignRoutes.CLOSE_CAMPAIGN(campaignId));
  return data;
}

export async function getCampaignPerformance(campaignId: string) {
  const { data } = await api.get(
    campaignRoutes.GET_CAMPAIGN_PERFORMANCE(campaignId)
  );
  return data;
}

export async function generateThreeDProduct(
  campaignId: string,
  productFile: string
) {
  const { data } = await api.post(
    campaignRoutes.GENERATE_3D_PRODUCT(campaignId),
    { fileName: productFile }
  );
  return data;
}

// Campaign invitations functions
export const getCampaignInvitations = async () => {
  const response = await api.get(campaignRoutes.GET_CAMPAIGN_INVITATIONS);
  return response.data;
};

export const respondToInvitation = async (
  invitationId: string,
  response: 'accepted' | 'rejected'
) => {
  const apiResponse = await api.put(
    campaignRoutes.RESPOND_TO_INVITATION(invitationId),
    { response }
  );
  return apiResponse.data;
};

export async function getCampaignPerformanceStats() {
  const { data } = await api.get(campaignRoutes.GET_CAMPAIGN_PERFORMANCE_STATS);
  return data;
}

export async function getBrandDashboardStats() {
  const { data } = await api.get(campaignRoutes.GET_BRAND_DASHBOARD_STATS);
  return data;
}
