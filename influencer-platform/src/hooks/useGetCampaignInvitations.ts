import { getCampaignInvitations } from '@/utils/api/handlers/campaign';
import { useEffect, useState } from 'react';

export default function useGetCampaignInvitations(
  options: {
    enabled?: boolean;
  } = { enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState(false);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const response = await getCampaignInvitations();
      setData(response.data || []);
      setError(false);
    } catch (err) {
      console.log('Error fetching campaign invitations:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!options.enabled) return;
    fetchInvitations();
  }, [options.enabled]);

  return { data, isLoading, error, refetch: fetchInvitations };
}
