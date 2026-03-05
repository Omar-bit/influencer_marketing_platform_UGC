const ROOT = '/campaign';

export const CREATE_CAMPAIGN = ROOT;
export const DRAFT_CAMPAIGN = `${ROOT}/draft`;
export const GET_ALL_CAMPAIGNS = ROOT;
export const GET_CAMPAIGN_BY_ID = (id: string) => `${ROOT}/${id}`;
export const GET_BRAND_CAMPAIGNS = `${ROOT}/business`;
export const EDIT_CAMPAIGN = (id: string) => `${ROOT}/${id}`;
export const DELETE_CAMPAIGN = (id: string) => `${ROOT}/${id}`;
export const CLOSE_CAMPAIGN = (id: string) => `${ROOT}/${id}/close`;

export const APPLY_TO_CAMPAIGN = (id: string) => `${ROOT}/${id}/apply`;
export const CHECK_APPLICATION_STATUS = (id: string) =>
  `${ROOT}/${id}/application-status`;
export const GET_CAMPAIGN_APPLICATIONS = (id: string) =>
  `${ROOT}/${id}/applications`;
export const GET_CAMPAIGN_APPLICATIONS_BY_INFLUENCER = `${ROOT}/applications/influencer`;
export const GET_ALL_BRAND_APPLICATIONS = `${ROOT}/applications`;
export const UPDATE_APPLICATION_STATUS = (id: string) =>
  `${ROOT}/applications/${id}/status`;
export const DELETE_APPLICATION = (id: string) => `${ROOT}/applications/${id}`;
export const GENERATE_3D_PRODUCT = (id: string) => `${ROOT}/${id}/generate-3d`;

// Routes for campaign performance
export const GET_CAMPAIGN_PERFORMANCE = (id: string) =>
  `${ROOT}/${id}/performance`;
export const GET_CAMPAIGN_PERFORMANCE_STATS = `${ROOT}/performance-stats`;

// Routes for campaign invitations
export const GET_CAMPAIGN_INVITATIONS = `${ROOT}/invitations`;
export const RESPOND_TO_INVITATION = (id: string) =>
  `${ROOT}/invitation/${id}/respond`;

// Brand dashboard stats
export const GET_BRAND_DASHBOARD_STATS = `${ROOT}/brand-dashboard-stats`;
