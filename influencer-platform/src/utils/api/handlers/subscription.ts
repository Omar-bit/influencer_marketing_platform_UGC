import * as subsRoutes from '../routes/subscription';
import { api } from '@/utils/axiosInstance';

/**
 * Submit a rating for an influencer application
 * @param applicationId ID of the application to be rated
 * @param rating Rating value (0-5)
 * @param feedback Optional feedback text
 */
export async function example(
  applicationId: string,
  rating: number,
  feedback?: string
) {
  const { data } = await api.post(subsRoutes.EXAMPLE(applicationId), {
    rating,
    feedback,
  });
  return data;
}

export async function getPlans() {
  const { data } = await api.get(subsRoutes.PLANS());
  return data;
}

export async function subscribeToPlan(planId: string) {
  const { data } = await api.post(subsRoutes.SUBSCRIBE(), { planId });
  return data;
}

export async function upgradePlan(planId: string) {
  const { data } = await api.post(subsRoutes.UPGRADE(), { planId });
  return data;
}

export async function cancelSubscription() {
  const { data } = await api.post(subsRoutes.CANCEL());
  return data;
}

export async function getMySubscription() {
  const { data } = await api.get(subsRoutes.GET_MY_SUBSCRIPTION());
  return data;
}
