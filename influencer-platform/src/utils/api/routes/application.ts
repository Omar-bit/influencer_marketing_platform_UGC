const root = '/campaign';
export const APPLY = (campaignId: string) => `${root}/${campaignId}/apply`;
export const CHECK_APPLICATION = (campaignId: string) =>
  `${root}/${campaignId}/application-status`;

export const GET_APPLICATIONS = `${root}/applications`;
export const GET_INFLUENCER_APPLICATIONS = `${root}/applications/influencer`;
export const UPDATE_APPLICATION_STATUS = (applicationId: string) =>
  `${root}/applications/${applicationId}/status`;
export const DELETE_APPLICATION = (applicationId: string) =>
  `${root}/applications/${applicationId}`;
