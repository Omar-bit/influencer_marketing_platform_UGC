import { getAllCampaignContents } from '@/utils/api/handlers/campaignContent';
import { useEffect, useState } from 'react';

export default function useGetAllCampaignContents(
  options: {
    status?: string | undefined;
    enabled?: boolean;
  } = { status: undefined, enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);

  const fetchCampaignContents = async () => {
    setIsLoading(true);
    try {
      const { data } = await getAllCampaignContents();
      setData(data);
      setError(false);
    } catch (err) {
      console.log('Error fetching campaigns:', err);

      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!options.enabled) return;
    fetchCampaignContents();
  }, [options.enabled]);
  return { data, isLoading, error, refetch: fetchCampaignContents };
}
