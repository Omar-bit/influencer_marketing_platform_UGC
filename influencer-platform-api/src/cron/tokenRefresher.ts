import cron from 'node-cron';
import axios from 'axios';
import User, { IUser } from '@models/user';
import logger from '@utils/logger';
import * as querystring from 'querystring';
import {
  INSTAGRAM_CLIENT_SECRET,
  TIKTOK_CLIENT_ID,
  TIKTOK_SECRET_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_SECRET,
} from '@utils/secrets';

function needsRefresh(expiresAt?: Date): boolean {
  if (!expiresAt) return true;

  const now = new Date();

  return expiresAt <= now;
}

async function refreshInstagramToken(
  userId: string,
  accessToken: string
): Promise<{ accessToken: string | null; expiresAt: Date | null }> {
  try {
    const response = await axios.get(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    return {
      accessToken: response.data.access_token,
      expiresAt,
    };
  } catch (error) {
    logger.error(
      `Failed to refresh Instagram token for user ${userId}: ${error}`
    );
    return { accessToken: null, expiresAt: null };
  }
}

async function refreshTikTokToken(
  userId: string,
  refreshToken: string
): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
}> {
  try {
    const { data } = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      querystring.stringify({
        client_key: TIKTOK_CLIENT_ID,
        client_secret: TIKTOK_SECRET_KEY,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 86400)); // Default 1 day if not provided

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    };
  } catch (error) {
    logger.error(`Failed to refresh TikTok token for user ${userId}: ${error}`);
    return { accessToken: null, refreshToken: null, expiresAt: null };
  }
}

async function refreshYoutubeToken(
  userId: string,
  refreshToken: string
): Promise<{ accessToken: string | null; expiresAt: Date | null }> {
  try {
    const { data } = await axios.post(
      'https://oauth2.googleapis.com/token',
      querystring.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600)); // Default 1 hour if not provided

    return {
      accessToken: data.access_token,
      expiresAt,
    };
  } catch (error) {
    logger.error(
      `Failed to refresh YouTube token for user ${userId}: ${error}`
    );
    return { accessToken: null, expiresAt: null };
  }
}

async function refreshAllTokens() {
  try {
    logger.info('Starting social media token refresh job');

    const users: IUser[] = await User.find({
      'socialMedia.0': { $exists: true },
    });

    for (const user of users) {
      for (let i = 0; i < user.socialMedia.length; i++) {
        const account = user.socialMedia[i];

        // rset shouldReconnect flag before attempting refresh
        user.socialMedia[i].shouldReconnect = false;

        if (!needsRefresh(account.tokenExpiresAt)) {
          logger.info(
            `Skipping refresh for ${account.platform} token for user ${user._id}, not expiring soon`
          );
          continue;
        }

        switch (account.platform) {
          case 'instagram':
            if (account.accessToken) {
              const result = await refreshInstagramToken(
                user._id,
                account.accessToken
              );
              if (result.accessToken) {
                user.socialMedia[i].accessToken = result.accessToken;
                user.socialMedia[i].tokenExpiresAt =
                  result.expiresAt ?? undefined;

                logger.info(
                  `Refreshed Instagram token for user ${user._id}, expires ${result.expiresAt}`
                );
              } else {
                // set reconnect flag if refresh failed
                user.socialMedia[i].shouldReconnect = true;
                logger.warn(
                  `Instagram token refresh failed for user ${user._id}, manual reconnect required`
                );
              }
            }
            break;

          case 'tiktok':
            if (account.refreshToken) {
              const result = await refreshTikTokToken(
                user._id,
                account.refreshToken
              );
              if (result.accessToken && result.refreshToken) {
                user.socialMedia[i].accessToken = result.accessToken;
                user.socialMedia[i].refreshToken = result.refreshToken;
                user.socialMedia[i].tokenExpiresAt =
                  result.expiresAt ?? undefined;
                logger.info(
                  `Refreshed TikTok token for user ${user._id}, expires ${result.expiresAt}`
                );
              } else {
                // Set reconnect flag if refresh failed
                user.socialMedia[i].shouldReconnect = true;
                logger.warn(
                  `TikTok token refresh failed for user ${user._id}, manual reconnect required`
                );
              }
            }
            break;

          case 'youtube':
            if (account.refreshToken) {
              const result = await refreshYoutubeToken(
                user._id,
                account.refreshToken
              );
              if (result.accessToken) {
                user.socialMedia[i].accessToken = result.accessToken;
                user.socialMedia[i].tokenExpiresAt =
                  result.expiresAt ?? undefined;

                logger.info(
                  `Refreshed YouTube token for user ${user._id}, expires ${result.expiresAt}`
                );
              } else {
                // set reconnect flag if refresh failed
                user.socialMedia[i].shouldReconnect = true;
                logger.warn(
                  `YouTube token refresh failed for user ${user._id}, manual reconnect required`
                );
              }
            }
            break;
        }
      }

      await user.save();
    }

    logger.info('Completed social media token refresh job');
  } catch (error) {
    logger.error(`Error in token refresh job: ${error}`);
  }
}

// '0 0 * * *' = At 00:00 every day

export function initTokenRefreshJob() {
  cron.schedule('0 0 * * *', refreshAllTokens);
  logger.info('Scheduled social media token refresh job');
}
export default initTokenRefreshJob;
