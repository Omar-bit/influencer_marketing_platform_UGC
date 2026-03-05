import { getCampaignPerformance } from '@/utils/api/handlers/campaign';
import { getAllCampaignContents } from '@/utils/api/handlers/campaignContent';
import { useEffect, useState } from 'react';

export default function useGetCampaignPerofmance(
  campaignId: string,
  options: {
    status?: string | undefined;
    enabled?: boolean;
  } = { status: undefined, enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const fetchCampaignPerormance = async () => {
    setIsLoading(true);
    try {
      const { data } = await getCampaignPerformance(campaignId);
      console.log('Campaign Performance API response:', data);
      setData(data);
      setError(false);
    } catch (err) {
      console.log('Error fetching campaign performance:', err);

      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!options.enabled || !campaignId) return;
    fetchCampaignPerormance();
  }, [options.enabled, campaignId]);
  return { data, isLoading, error, refetch: fetchCampaignPerormance };
}
