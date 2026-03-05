import { getInfluencers } from '@/utils/api/handlers/influencer';
import { useEffect, useState } from 'react';

export default function useRelevantInfluencers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetchData = async () => {
    try {
      const { data } = await getInfluencers();

      setData(data);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return { data, loading, error };
}
