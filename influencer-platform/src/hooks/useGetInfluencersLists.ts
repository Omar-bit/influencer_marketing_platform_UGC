import { getBrandInluencersLists } from '@/utils/api/handlers/influencersLists';

import { useEffect, useState } from 'react';

export default function useGetInfluencersLists(
  brandId: string,
  options: {
    enabled?: boolean;
  } = { enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  const fetchLists = async () => {
    setIsLoading(true);
    try {
      const { data } = await getBrandInluencersLists(brandId);
      setData(data);
      setError(false);
    } catch (err) {
      console.log('Error fetching influencers lists for brand :', brandId, err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!options.enabled) return;
    fetchLists();
  }, [brandId, options.enabled]);

  return { data, isLoading, error, refetch: fetchLists };
}
