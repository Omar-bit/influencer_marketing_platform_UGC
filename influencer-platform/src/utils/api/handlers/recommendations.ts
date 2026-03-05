import { api } from '@/utils/axiosInstance';
import { GET_INFLUENCER_RECOMMENDATIONS } from '../routes/recommendations';

interface RecommendationParams {
  categories?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  location?: string;
  languages?: string[];
  platforms?: string[];
  minRating?: number;
}

export const getInfluencerRecommendations = async (
  params?: RecommendationParams
) => {
  const queryParams = new URLSearchParams();

  if (params) {
    if (params.categories && params.categories.length > 0) {
      params.categories.forEach((category) =>
        queryParams.append('categories', category)
      );
    }

    if (params.minFollowers) {
      queryParams.append('minFollowers', params.minFollowers.toString());
    }

    if (params.maxFollowers) {
      queryParams.append('maxFollowers', params.maxFollowers.toString());
    }

    if (params.location) {
      queryParams.append('location', params.location);
    }

    if (params.languages && params.languages.length > 0) {
      params.languages.forEach((language) =>
        queryParams.append('languages', language)
      );
    }

    if (params.platforms && params.platforms.length > 0) {
      params.platforms.forEach((platform) =>
        queryParams.append('platforms', platform)
      );
    }

    if (params.minRating) {
      queryParams.append('minRating', params.minRating.toString());
    }
  }

  const queryString = queryParams.toString();
  const url = queryString
    ? `${GET_INFLUENCER_RECOMMENDATIONS}?${queryString}`
    : GET_INFLUENCER_RECOMMENDATIONS;

  const { data } = await api.get(url);
  return data;
};
