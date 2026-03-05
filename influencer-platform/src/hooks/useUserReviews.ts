import { getUserReviews } from '@/utils/api/handlers/review';

import { useEffect, useState } from 'react';

export default function useUserReviews(
  userId: string,
  options: {
    enabled?: boolean;
  } = { enabled: true }
) {
  console.log({ option: options.enabled });

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data: newData } = await getUserReviews(userId);
      setData(newData);
      setError(false);
    } catch (err) {
      console.log('Error fetching reviews:', err);

      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!options.enabled) return;
    fetchReviews();
  }, [userId, options.enabled]);
  return { data, isLoading, error };
}
