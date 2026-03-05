import { getBrandCampaigns } from '@/utils/api/handlers/campaign';
import { useEffect, useState } from 'react';

export default function useBrandCampaigns(
  brandId: string,
  options: {
    status?: string | undefined;
    enabled?: boolean;
  } = { status: undefined, enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const { data } = await getBrandCampaigns(brandId, {
        status: options.status,
      });
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
    fetchCampaigns();
  }, [brandId, options.enabled]);
  return { data, isLoading, error, refetch: fetchCampaigns };
}
