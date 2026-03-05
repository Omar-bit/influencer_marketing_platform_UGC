import {
  getBrandCampaigns,
  getCampaignById,
} from '@/utils/api/handlers/campaign';
import { useEffect, useState } from 'react';

export default function useGetCampaign(
  campaignId: string,
  options: {
    enabled?: boolean;
  } = { enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  const fetchCampaign = async () => {
    setIsLoading(true);
    try {
      const { data } = await getCampaignById(campaignId);
      setData(data);
      setError(false);
    } catch (err) {
      console.log('Error fetching campaign:' + campaignId, err);

      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!options.enabled) return;
    fetchCampaign();
  }, [campaignId, options.enabled]);
  return { data, isLoading, error, refetch: fetchCampaign };
}
