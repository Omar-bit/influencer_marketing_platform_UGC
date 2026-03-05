import { getUserRatings } from '@/utils/api/handlers/rating';
import { useEffect, useState } from 'react';

export default function useGetUserReviews(
  userId: string,
  options: {
    enabled?: boolean;
  } = { enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  const fetchUserReviews = async () => {
    setIsLoading(true);
    try {
      const { data } = await getUserRatings(userId);
      setData(data);
      setError(false);
    } catch (err) {
      console.log('Error fetching userReviews:' + userId, err);

      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!options.enabled) return;
    fetchUserReviews();
  }, [userId, options.enabled]);
  return { data, isLoading, error };
}
