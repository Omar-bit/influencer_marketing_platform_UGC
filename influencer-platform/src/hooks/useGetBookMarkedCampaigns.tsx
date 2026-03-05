import { getUserBookmarkedCampaigns } from '@/utils/api/handlers/bookMarks';
import { useEffect, useState } from 'react';

export default function useGetBookMarkedCampaigns(
  options: {
    enabled?: boolean;
  } = { enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  const fetchBookMarkedCampaigns = async () => {
    setIsLoading(true);
    try {
      const { data } = await getUserBookmarkedCampaigns();
      setData(data);
      setError(false);
    } catch (err) {
      console.log('Error fetching bookmarked campaigns :', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!options.enabled) return;
    fetchBookMarkedCampaigns();
  }, [options.enabled]);

  return { data, isLoading, error, refetch: fetchBookMarkedCampaigns };
}
