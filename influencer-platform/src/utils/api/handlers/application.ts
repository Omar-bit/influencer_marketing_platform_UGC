import * as applicationRoutes from '../routes/application';
import { api } from '@/utils/axiosInstance';
export async function applyToCampaign(
  campaignId: string,
  reqData: {
    proposal: string;
  }
) {
  const { data } = await api.post(applicationRoutes.APPLY(campaignId), reqData);
  return data;
}

export async function checkApplicationStatus(campaignId: string) {
  const { data } = await api.get(
    applicationRoutes.CHECK_APPLICATION(campaignId)
  );
  return data;
}

export async function getBrandsAllApplications() {
  const { data } = await api.get(applicationRoutes.GET_APPLICATIONS);
  return data;
}

export async function updateApplicationStatus(
  applicationId: string,
  reqData: {
    status: 'accepted' | 'rejected';
  }
) {
  const { data } = await api.put(
    applicationRoutes.UPDATE_APPLICATION_STATUS(applicationId),
    reqData
  );
  return data;
}

export async function getInfluencerApplications() {
  const { data } = await api.get(applicationRoutes.GET_INFLUENCER_APPLICATIONS);
  return data;
}
