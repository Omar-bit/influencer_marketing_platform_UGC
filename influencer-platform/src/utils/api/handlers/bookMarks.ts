import * as bookMarkesRoutes from '../routes/bookMarks';
import { api } from '@/utils/axiosInstance';
export async function bookMarkCampaign(reqData: { campaignId: string }) {
  const { data } = await api.post(bookMarkesRoutes.BOOKMARK_CAMPAIGN, reqData);
  return data;
}

export async function getUserBookmarkedCampaigns() {
  const { data } = await api.get(bookMarkesRoutes.GET_BOOKMARKED_CAMPAIGNS);

  return data;
}

export async function removeBookmarkedCampaign(campaignId: string) {
  const { data } = await api.delete(
    bookMarkesRoutes.DELETE_BOOKMARKED_CAMPAIGN(campaignId)
  );
  return data;
}
