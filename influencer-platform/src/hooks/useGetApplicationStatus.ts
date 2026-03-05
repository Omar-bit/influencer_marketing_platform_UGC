import { checkApplicationStatus } from '@/utils/api/handlers/application';
import { useEffect, useState } from 'react';

export default function useGetApplicationStatus(
  campaignId: string,
  options: {
    enabled?: boolean;
  } = { enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const { data } = await checkApplicationStatus(campaignId);
      setData(data);
      setError(false);
    } catch (err) {
      console.log(
        'Error fetching application status for campaign:',
        campaignId,
        err
      );
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!options.enabled) return;
    fetchStatus();
  }, [campaignId, options.enabled]);

  return { data, isLoading, error, refetch: fetchStatus };
}
