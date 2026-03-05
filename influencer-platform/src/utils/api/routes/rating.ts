const root = '/rating';

export const SUBMIT_RATING = (applicationId: string) =>
  `${root}/application/${applicationId}`;

export const GET_USER_RATINGS = (userId: string) => `${root}/user/${userId}`;

export const GET_USER_AVERAGE_RATING = (userId: string) =>
  `${root}/user/${userId}/average`;

export const SUBMIT_RATING_BY_CAMPAIGN_ID = (campaignId: string) =>
  `${root}/campaign/${campaignId}`;
