const root = '/bookmarks';
export const BOOKMARK_CAMPAIGN = `${root}`;
export const DELETE_BOOKMARKED_CAMPAIGN = (campaignId: string) =>
  `${root}/${campaignId}`;
export const GET_BOOKMARKED_CAMPAIGNS = `${root}`;
