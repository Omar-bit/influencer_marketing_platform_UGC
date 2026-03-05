const root = '/influencers-list';
export const CREATE_INFLUENCERS_LIST = `${root}/`;
export const GET_INFLUENCERS_LISTS = `${root}/business/`;
export const UPDATE_INFLUENCERS_LIST = `${root}/`;
export const DELETE_INFLUENCERS_LIST = `${root}/`;
export const ADD_MEMBERS_TO_LIST = (listId: string) =>
  `${root}/${listId}/members`;
