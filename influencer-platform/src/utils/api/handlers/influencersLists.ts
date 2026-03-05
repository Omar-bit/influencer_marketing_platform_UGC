import * as influencersListsRoutes from '../routes/influencersLists';
import { api } from '@/utils/axiosInstance';
export async function createInfluencersList(reqData: any) {
  const { data } = await api.post(
    influencersListsRoutes.CREATE_INFLUENCERS_LIST,
    reqData
  );
  return data;
}

export async function getBrandInluencersLists(brandId: string) {
  const { data } = await api.get(
    influencersListsRoutes.GET_INFLUENCERS_LISTS + brandId
  );
  return data;
}

export async function updateInfluencersList(listId: string, reqData: any) {
  const { data } = await api.put(
    influencersListsRoutes.UPDATE_INFLUENCERS_LIST + listId,
    reqData
  );
  return data;
}

export async function deleteInfluencersList(listId: string) {
  const { data } = await api.delete(
    influencersListsRoutes.DELETE_INFLUENCERS_LIST + listId
  );
  return data;
}

export async function addMembersToList(listId: string, reqData: any) {
  const { data } = await api.put(
    influencersListsRoutes.ADD_MEMBERS_TO_LIST(listId),
    reqData
  );
  return data;
}
