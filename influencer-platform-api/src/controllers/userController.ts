import User, { IUser } from '@models/user';
import { INSTAGRAM_REDIRECT_URI, TIKTOK_REDIRECT_URI } from '@utils/constants';
import logger from '@utils/logger';
import {
  BASE_URL,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  FRONTEND_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_SECRET,
  INSTAGRAM_CLIENT_ID,
  INSTAGRAM_CLIENT_SECRET,
  TIKTOK_CLIENT_ID,
  TIKTOK_SECRET_KEY,
} from '@utils/secrets';
import axios from 'axios';
import { Request, Response } from 'express';
import * as querystring from 'querystring';
import { updateUserSocialMediaMetrics } from '@services/socialMediaMetricsService';
import { createNotification } from '@controllers/notificationController';

export async function updateProfile(req: any, res: Response) {
  try {
    const profilePicture = req.file.filename;
    const { userId } = req.user;
    let updates = req.body;

    if (profilePicture) {
      updates = { ...updates, profilePicture };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates).select(
      '-password -twoFASecret'
    );
    if (!updatedUser) {
      throw new Error('User not found');
    }
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
    logger.info(`User profile update successfully: ${updatedUser.email}`);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
    logger.error(`User profile update failed: ${err.message}`);
  }
}

export async function initiateInstagramAuth(req: Request, res: Response) {
  try {
    // const scopes = `instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,pages_read_engagement,pages_show_list,instagram_basic`;
    const scopes = `instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights`;
    //instagram_manage_insights , instagram_business_manage_insights , read_insights
    //@ts-ignore
    const url = `https://instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&scope=${scopes}&response_type=code&state=${req.user.userId}`;
    console.log('url', url);

    res.redirect(url);
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function handleInstagramCallback(req: Request, res: Response) {
  const { code, state: userId } = req.query;
  if (!userId) {
    res.status(400).json({ success: false, message: 'Invalid user' });
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  if (!code) {
    res.status(400).json({ success: false, message: 'Invalid code' });
    return;
  }
  try {
    const params = new URLSearchParams();
    params.append('client_id', INSTAGRAM_CLIENT_ID);
    params.append('client_secret', INSTAGRAM_CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', INSTAGRAM_REDIRECT_URI);
    params.append('code', code as string);

    const tokenResponse = await axios.post(
      'https://api.instagram.com/oauth/access_token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    console.log('tokenResponse', tokenResponse.data);

    const { access_token: shortLivedToken, user_id } = tokenResponse.data;

    const longLivedTokenResponse = await axios.get(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${shortLivedToken}`
    );
    const { access_token: longLivedToken, expires_in } =
      longLivedTokenResponse.data;

    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expires_in);

    const accountResponse = await axios.get(
      `https://graph.instagram.com/v22.0/me?fields=user_id,username,followers_count&access_token=${longLivedToken}`
    );
    const { username, followers_count, user_id: pageId } = accountResponse.data;
    console.log('data', username, followers_count);

    const existingInstagram = user.socialMedia.find(
      (acc: any) => acc.platform === 'instagram'
    );

    if (existingInstagram) {
      existingInstagram.accessToken = longLivedToken;
      existingInstagram.refreshToken = shortLivedToken;
      existingInstagram.userId = user_id;
      existingInstagram.followers = followers_count;
      existingInstagram.username = username;
      existingInstagram.tokenExpiresAt = tokenExpiresAt;
      existingInstagram.pageId = pageId;
    } else {
      user.socialMedia.push({
        platform: 'instagram',
        accessToken: longLivedToken,
        refreshToken: shortLivedToken,
        userId: user_id,
        username,
        followers: followers_count,
        tokenExpiresAt: tokenExpiresAt,
        pageId: pageId,
      });
    }

    await user.save();

    try {
      await createNotification(
        userId as string,
        'Instagram Account Connected',
        `Your Instagram account @${username} has been successfully connected to your profile.`,
        'system'
      );
    } catch (error) {
      logger.error(
        `Failed to create notification for Instagram connection: ${error}`
      );
    }
    const userType = user.type === 'influencer' ? 'influencer' : 'brand';
    const redirectUrl = `${FRONTEND_URL}/${userType}/profile`;
    res.redirect(redirectUrl);
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function handleTiktokCallback(req: Request, res: Response) {
  const { code, state: userId } = req.query;
  if (!userId) {
    res.status(400).json({ success: false, message: 'Invalid user' });
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  if (!code) {
    res.status(400).json({ success: false, message: 'Invalid code' });
    return;
  }

  try {
    const { data: tiktokTokenResponse } = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      querystring.stringify({
        client_key: TIKTOK_CLIENT_ID,
        client_secret: TIKTOK_SECRET_KEY,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
        code: code as string,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
      }
    );
    const {
      access_token: tiktokAccessToken,
      refresh_token: tiktokRefreshToken,
      expires_in,
    } = tiktokTokenResponse;

    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expires_in);

    console.log('data' + ' ' + tiktokAccessToken);
    const { data: accountResponse } = await axios.get(
      `https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,username,follower_count,likes_count`,
      {
        headers: {
          Authorization: `Bearer ${tiktokAccessToken}`,
        },
      }
    );
    const { username, follower_count, likes_count, open_id, union_id } =
      accountResponse.data.user;

    const existingTiktok = user.socialMedia.find(
      (acc: any) => acc.platform === 'tiktok' && acc.userId == union_id
    );

    if (existingTiktok) {
      existingTiktok.accessToken = tiktokAccessToken;
      existingTiktok.refreshToken = tiktokRefreshToken;
      existingTiktok.userId = union_id;
      existingTiktok.followers = follower_count;
      existingTiktok.username = username;
      existingTiktok.tokenExpiresAt = tokenExpiresAt;
    } else {
      user.socialMedia.push({
        platform: 'tiktok',
        accessToken: tiktokAccessToken,
        userId: union_id,
        username,
        refreshToken: tiktokRefreshToken,
        followers: follower_count,
        likesCount: likes_count,
        tokenExpiresAt: tokenExpiresAt,
      });
    }

    await user.save();

    try {
      await createNotification(
        userId as string,
        'TikTok Account Connected',
        `Your TikTok account @${username} has been successfully connected to your profile.`,
        'system'
      );
    } catch (error) {
      logger.error(
        `Failed to create notification for TikTok connection: ${error}`
      );
    }

    const userType = user.type === 'influencer' ? 'influencer' : 'brand';
    const redirectUrl = `${FRONTEND_URL}/${userType}/profile`;
    res.redirect(redirectUrl);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function initiateTiktokAuth(req: Request, res: Response) {
  try {
    //@ts-ignore
    let url = `https://www.tiktok.com/v2/auth/authorize`;
    url += `?client_key=${TIKTOK_CLIENT_ID}`;
    url +=
      '&scope=user.info.basic,user.info.stats,video.publish,user.info.profile,video.list,video.upload,artist.certification.read';
    url += '&response_type=code';
    url += `&redirect_uri=${TIKTOK_REDIRECT_URI}`;
    //@ts-ignore
    url += '&state=' + req.user.userId;

    res.redirect(url);
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function initiateYoutubeAuth(req: Request, res: Response) {
  try {
    const scope = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'profile',
    ].join(' ');

    const url =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      querystring.stringify({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: 'http://localhost:5000/api/user/youtube/callback',
        response_type: 'code',
        scope,
        access_type: 'offline',
        prompt: 'consent',
        //@ts-ignore
        state: req?.user?.userId,
      });
    res.redirect(url);
  } catch (err: any) {
    console.log('youtube err', err);
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function handleYoutubeCallback(req: Request, res: Response) {
  const { code, state: userId } = req.query;

  if (!userId) {
    res.status(400).json({ success: false, message: 'Invalid user' });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (!code) {
    res.status(400).json({ success: false, message: 'Invalid code' });
    return;
  }

  try {
    const { data: tokenData } = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_SECRET,
        redirect_uri: 'http://localhost:5000/api/user/youtube/callback',
        grant_type: 'authorization_code',
      }
    );

    const { access_token, refresh_token, expires_in } = tokenData;

    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expires_in);

    const { data: channelData } = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const channel = channelData.items?.[0];
    if (!channel) {
      throw new Error('YouTube channel not found');
    }

    const {
      id: channelId,
      snippet: { title },
      statistics: { subscriberCount },
    } = channel;

    const existingYoutube = user.socialMedia.find(
      (acc: any) => acc.platform === 'youtube' && acc.userId == channelId
    );

    if (existingYoutube) {
      existingYoutube.accessToken = access_token;
      existingYoutube.refreshToken = refresh_token;
      existingYoutube.userId = channelId;
      existingYoutube.username = title;
      existingYoutube.followers = subscriberCount;
      existingYoutube.tokenExpiresAt = tokenExpiresAt;
    } else {
      user.socialMedia.push({
        platform: 'youtube',
        accessToken: access_token,
        refreshToken: refresh_token,
        userId: channelId,
        username: title,
        followers: subscriberCount,
        tokenExpiresAt: tokenExpiresAt,
      });
    }

    await user.save();

    try {
      await createNotification(
        userId as string,
        'YouTube Channel Connected',
        `Your YouTube channel "${title}" has been successfully connected to your profile.`,
        'system'
      );
    } catch (error) {
      logger.error(
        `Failed to create notification for YouTube connection: ${error}`
      );
    }

    const userType = user.type === 'influencer' ? 'influencer' : 'brand';
    const redirectUrl = `${FRONTEND_URL}/${userType}/profile`;
    res.redirect(redirectUrl);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function refreshSocialMediaMetrics(req: Request, res: Response) {
  // @ts-ignore
  const userId = req.user.userId;
  try {
    const user: IUser | null = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.socialMedia) {
      res.status(400).json({
        success: false,
        message: 'No social media accounts connected',
      });
      return;
    }
    if (user?.socialMedia?.length == 0) {
      res.status(400).json({
        success: false,
        message: 'No social media accounts connected',
      });
      return;
    }

    const result = await updateUserSocialMediaMetrics(user);

    if (result.updated) {
      res.json({
        success: true,
        message: 'Social media metrics refreshed successfully',
        updatedPlatforms: result.platforms,
      });
      return;
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to refresh social media metrics',
      });
      return;
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
    return;
  }
}

export async function getSocialMediaMetrics(req: Request, res: Response) {
  try {
    //@ts-ignore
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const metrics = user.socialMedia.map((account: any) => ({
      platform: account.platform,
      username: account.username,
      followers: account.followers,
      engagementRate: account.engagementRate,
      likesCount: account.likesCount,
      shouldReconnect: account.shouldReconnect,
      lastUpdated: account.tokenExpiresAt
        ? new Date(account.tokenExpiresAt).getTime()
        : null,
    }));

    if (metrics.length === 0) {
      res.json({
        success: false,
        message: 'No social media accounts connected',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Social media metrics retrieved successfully',
      data: metrics,
    });
    return;
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }
}

export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const user: IUser | null = await User.findById(id, {
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
      otpCode: 0,
      failedAttempts: 0,
      lockUntil: 0,
      passKey: 0,
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
    return;
  }
}
