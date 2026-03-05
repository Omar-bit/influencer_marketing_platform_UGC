import * as adminRoutes from '../routes/admin';
import { api } from '@/utils/axiosInstance';

export async function getAdminDashboardStats() {
  const { data } = await api.get(adminRoutes.ADMIN_DASHBOARD_STATS);
  return data;
}

export async function getAdminUsers() {
  const { data } = await api.get(adminRoutes.ADMIN_USERS);
  return data;
}

export async function toggleUserStatus(
  userId: string,
  status: 'active' | 'inactive'
) {
  const { data } = await api.put(
    `${adminRoutes.ADMIN_TOGGLE_USER_STATUS}/${userId}`,
    { status }
  );
  return data;
}

export async function getAdminCampaigns() {
  const { data } = await api.get(adminRoutes.ADMIN_CAMPAIGNS);
  return data;
}

export async function updateCampaignStatus(
  campaignId: string,
  status: 'unpaid' | 'rejected'
) {
  const { data } = await api.put(
    `${adminRoutes.ADMIN_UPDATE_CAMPAIGN_STATUS}/${campaignId}`,
    { status }
  );
  return data;
}

export async function getAdminSubscriptionIncomes() {
  const { data } = await api.get(adminRoutes.ADMIN_SUBSCRIPTION_INCOMES);
  return data;
}
