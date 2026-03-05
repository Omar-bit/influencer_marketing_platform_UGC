import { getAllCampaigns } from '@/utils/api/handlers/campaign';
import { useEffect, useState } from 'react';

export default function useGetCampaigns() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetchData = async () => {
    try {
      const { data } = await getAllCampaigns();
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
