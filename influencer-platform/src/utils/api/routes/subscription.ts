const root = '/subscriptions';

export const PLANS = () => `${root}/plans`;
export const SUBSCRIBE = () => `${root}/subscribe`;
export const UPGRADE = () => `${root}/upgrade`;
export const CANCEL = () => `${root}/cancel`;
export const GET_MY_SUBSCRIPTION = () => `${root}/my-subscription`;

export const EXAMPLE = (applicationId: string) =>
  `${root}/application/${applicationId}`;
