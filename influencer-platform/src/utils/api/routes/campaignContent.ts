const root = '/ai';
export const GENERATE_PROPOSAL = `${root}/generate-proposal`;
export const GENERATE_CONTENT_SUGGESTIONS = (applicationId: string) =>
  `${root}/content-suggestions/${applicationId}`;
export const PAY_CONTENT = (contentId: string) =>
  `${root}/payment/${contentId}`;
