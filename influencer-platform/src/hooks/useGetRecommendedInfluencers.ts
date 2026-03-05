import { getInfluencers } from '@/utils/api/handlers/influencer';
import { useState, useEffect } from 'react';

// This hook fetches and returns recommended influencers based on campaign criteria
export default function useGetRecommendedInfluencers(
  campaignData: any,
  options: {
    enabled?: boolean;
  } = { enabled: true }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState(false);

  const fetchRecommendedInfluencers = async () => {
    setIsLoading(true);
    try {
      // For now, we'll fetch all influencers and filter them client-side
      // In a production environment, this would ideally be a dedicated API endpoint
      const response = await getInfluencers();

      // Simple recommendation algorithm based on campaign criteria
      let recommended = response.data || [];

      // Filter based on platform if specified in campaign
      if (campaignData?.platforms?.length > 0) {
        recommended = recommended.filter((influencer: any) => {
          return campaignData.platforms.some((platform: string) =>
            influencer.socialMedia?.some(
              (social: any) => social.platform === platform
            )
          );
        });
      }

      // Filter based on niche if specified
      if (campaignData?.niche) {
        recommended = recommended.filter((influencer: any) =>
          influencer.niches?.includes(campaignData.niche)
        );
      }

      // Filter based on location if specified
      if (campaignData?.location) {
        recommended = recommended.filter((influencer: any) =>
          influencer.location?.includes(campaignData.location)
        );
      }

      // Sort by relevance (for now, just by follower count)
      recommended.sort((a: any, b: any) => {
        const aFollowers = a.socialMedia?.[0]?.metrics?.followers || 0;
        const bFollowers = b.socialMedia?.[0]?.metrics?.followers || 0;
        return bFollowers - aFollowers;
      });

      setData(recommended);
      setError(false);
    } catch (err) {
      console.error('Error fetching recommended influencers:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (options.enabled && campaignData) {
      fetchRecommendedInfluencers();
    }
  }, [campaignData, options.enabled]);

  return { data, isLoading, error, refetch: fetchRecommendedInfluencers };
}
