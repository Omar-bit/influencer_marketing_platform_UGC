import * as reviewRoutes from '../routes/review';
import { api } from '@/utils/axiosInstance';
export async function createReview(reqData: any) {
  const { data } = await api.post(reviewRoutes.CREATE_REVIEW, reqData);
  return data;
}

export async function getUserReviews(userId: string) {
  const { data } = await api.get(reviewRoutes.GET_USER_REVIEWS + '/' + userId);

  return data;
}
