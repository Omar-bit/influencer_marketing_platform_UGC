import axios from 'axios';
import logger from '@utils/logger';
import { IUser } from '@models/user';
import { GOOGLE_CLIENT_ID, GOOGLE_SECRET } from '@utils/secrets';

interface MetricsResult {
  success: boolean;
  platform: string;
  followers?: number;
  engagementRate?: number;
  likesCount?: number;
  username?: string;
}

export async function fetchInstagramMetrics(
  accessToken: string
): Promise<MetricsResult> {
  try {
    const response = await axios.get(
      `https://graph.instagram.com/v22.0/me?fields=user_id,username,followers_count&access_token=${accessToken}`
    );

    const { username, followers_count } = response.data;

    return {
      success: true,
      platform: 'instagram',
      followers: followers_count,
      username,
    };
  } catch (error) {
    logger.error(`Failed to fetch Instagram metrics: ${error}`);
    return {
      success: false,
      platform: 'instagram',
    };
  }
}

export async function fetchTiktokMetrics(
  accessToken: string
): Promise<MetricsResult> {
  try {
    const response = await axios.get(
      `https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,username,follower_count,likes_count`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { username, follower_count, likes_count } = response.data.data.user;

    return {
      success: true,
      platform: 'tiktok',
      followers: follower_count,
      likesCount: likes_count,
      username,
    };
  } catch (error) {
    logger.error(`Failed to fetch TikTok metrics: ${error}`);
    return {
      success: false,
      platform: 'tiktok',
    };
  }
}

export async function fetchYoutubeMetrics(
  accessToken: string
): Promise<MetricsResult> {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const channel = response.data.items?.[0];
    if (!channel) {
      throw new Error('YouTube channel not found');
    }

    const {
      snippet: { title },
      statistics: { subscriberCount, viewCount },
    } = channel;

    // Calculate approximate engagement rate based on views and subscribers
    const engagementRate =
      viewCount && subscriberCount
        ? parseFloat(
            ((Number(viewCount) / Number(subscriberCount)) * 0.01).toFixed(2)
          )
        : undefined;

    return {
      success: true,
      platform: 'youtube',
      followers: parseInt(subscriberCount),
      engagementRate,
      username: title,
    };
  } catch (error) {
    logger.error(`Failed to fetch YouTube metrics: ${error}`);
    return {
      success: false,
      platform: 'youtube',
    };
  }
}

export async function updateUserSocialMediaMetrics(user: IUser): Promise<{
  updated: boolean;
  platforms: string[];
}> {
  try {
    const updatedPlatforms: string[] = [];
    if (!user || !user.socialMedia) {
      return {
        updated: false,
        platforms: [],
      };
    }
    for (let i = 0; i < user?.socialMedia?.length; i++) {
      const account = user.socialMedia[i];
      if (!account.accessToken) continue;

      let result: MetricsResult | null = null;

      switch (account.platform) {
        case 'instagram':
          result = await fetchInstagramMetrics(account.accessToken);
          break;
        case 'tiktok':
          result = await fetchTiktokMetrics(account.accessToken);
          break;
        case 'youtube':
          result = await fetchYoutubeMetrics(account.accessToken);
          break;
      }

      if (result && result.success) {
        // Update metrics with fresh data
        if (result.followers !== undefined) {
          user.socialMedia[i].followers = result.followers;
        }
        if (result.engagementRate !== undefined) {
          user.socialMedia[i].engagementRate = result.engagementRate;
        }
        if (result.likesCount !== undefined) {
          user.socialMedia[i].likesCount = result.likesCount;
        }
        if (result.username !== undefined) {
          user.socialMedia[i].username = result.username;
        }

        updatedPlatforms.push(account.platform);
      }
    }

    if (updatedPlatforms.length > 0) {
      await user.save();
      return {
        updated: true,
        platforms: updatedPlatforms,
      };
    }

    return {
      updated: false,
      platforms: [],
    };
  } catch (error) {
    logger.error(`Error updating social media metrics: ${error}`);
    return {
      updated: false,
      platforms: [],
    };
  }
}
