import * as aiRouter from '../routes/ai';
import { api } from '@/utils/axiosInstance';

export async function generateAIProposal(reqData: any) {
  const { data } = await api.post(aiRouter.GENERATE_PROPOSAL, reqData);
  return data;
}

export async function getContentSuggestions(applicationId: string) {
  const { data } = await api.get(
    aiRouter.GENERATE_CONTENT_SUGGESTIONS(applicationId)
  );
  return data;
}
