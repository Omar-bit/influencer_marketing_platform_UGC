import { useState, useEffect } from 'react';
import { getInfluencerRecommendations } from '@/utils/api/handlers/recommendations';

interface RecommendationParams {
  categories?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  location?: string;
  languages?: string[];
  platforms?: string[];
  minRating?: number;
}

export default function useInfluencerRecommendations(
  params?: RecommendationParams
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getInfluencerRecommendations(params);
        setData(response.data || []);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to fetch recommendations')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    params?.categories?.join(','),
    params?.minFollowers,
    params?.maxFollowers,
    params?.location,
    params?.languages?.join(','),
    params?.platforms?.join(','),
    params?.minRating,
  ]);

  return { data, loading, error };
}
