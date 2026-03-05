'use client';
import { getInfluencerIncomes } from '@/utils/api/handlers/influencer';
import { useEffect, useState } from 'react';

export default function useGetInfluencerIncomes(
  options: {
    enabled?: boolean;
  } = { enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  const fetchIncomes = async () => {
    setIsLoading(true);
    try {
      const { data } = await getInfluencerIncomes();
      setData(data);
      setError(false);
    } catch (err) {
      console.log('Error fetching Influencer Incomes:', err);

      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!options.enabled) return;
    fetchIncomes();
  }, [options.enabled]);
  return { data, isLoading, error };
}
