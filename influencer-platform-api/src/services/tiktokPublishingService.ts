import mongoose from 'mongoose';
import CampaignContent, { ICampaignContent } from '../models/campaignContent';
import User, { IUser } from '../models/user';
import axios from 'axios';
import { MONGO_URI } from '../utils/secrets';
import logger from '../utils/logger';
import InfluencerApplication from '../models/influencerApplication';

async function validateAndGetInfluencerData(
  campaignPost: ICampaignContent
): Promise<{ accessToken: string; userId: string }> {
  const application = await InfluencerApplication.findById(
    campaignPost.application
  );
  if (!application) throw new Error('Application not found');

  const influencer = await User.findById(application.influencer);
  if (!influencer) throw new Error('Influencer not found');
  const influencerTiktok = influencer.socialMedia?.find(
    (platform: IUser['socialMedia'][0]) => platform.platform === 'tiktok'
  );
  if (!influencerTiktok) throw new Error('tiktok account not found');

  return {
    accessToken: influencerTiktok.accessToken as string,
    userId: influencerTiktok.pageId || influencerTiktok.userId,
  };
}

export async function postToTiktok(campaignPost: ICampaignContent) {
  try {
    const { accessToken } = await validateAndGetInfluencerData(campaignPost);

    const isCarrousel = campaignPost.contentAssets.length > 1;
    const caption = `${campaignPost.title}\n\n${campaignPost.description}`;
    const tags = campaignPost.tags.map((tag) => `#${tag}`).join(' ');

    //get first video asset (from external url)
    const videoAsset = campaignPost.contentAssets.find((asset) =>
      asset.endsWith('.mp4')
    );

    if (!videoAsset) throw new Error('Video asset not found');
    const postData = {
      post_info: {
        title: campaignPost.title + ' \n ' + caption,
        privacy_level: 'SELF_ONLY', //MUTUAL_FOLLOW_FRIENDS , SELF_ONLY
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoAsset, //external url of the video asset
      },
    };
    console.log('Post data:', postData);
    console.log('Authorization:', `Bearer ${accessToken}`);
    console.log(
      'publishResponse:',
      'https://open.tiktokapis.com/v2/post/publish/video/init/'
    );

    const publishResponse = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      postData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (publishResponse.data.error.code !== 'ok') {
      throw new Error(publishResponse.data.error.message);
    }
    await wait(6000);

    //https://open.tiktokapis.com/v2/post/publish/status/fetch/
    const postStatus = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
      {
        publish_id: publishResponse.data.data.publish_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const status = postStatus.data.data.status;
    console.log('tiktkok status', status);

    if (status !== 'PUBLISH_COMPLETE') {
      throw new Error('Post not published yet. Status: ' + status);
    }

    const postIdResponse = await axios.post(
      'https://open.tiktokapis.com/v2/video/list/?fields=id,title',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const postId = postIdResponse.data.data.videos[0].id;
    console.log('Post ID:', postId);

    const posts = campaignPost.posts || [];
    posts?.push({
      platform: 'tiktok',
      postId: postId as string,
    });
    campaignPost.posts = posts;
    await campaignPost.save();
    console.log('Post ID saved to campaign post:', postId);

    return postId;
  } catch (error: any) {
    console.error('Error posting to TikTok:', error.message);
  }
}

export async function getTiktokMetrics(postId: string, accessToken: string) {
  //https://open.tiktokapis.com/v2/video/query/?fields=id,create_time,cover_image_url,share_url,video_description,duration,height,width,title,embed_html,embed_link,like_count,comment_count,share_count,view_count
  const metricsResponse = await axios.post(
    'https://open.tiktokapis.com/v2/video/query/?fields=id,create_time,cover_image_url,share_url,video_description,duration,height,width,title,embed_html,embed_link,like_count,comment_count,share_count,view_count',

    {
      filters: { video_ids: [postId] },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const metricsData = metricsResponse.data.data.videos[0];
  /*
  {
  
  like_count: 0,
  
  share_count: 0,
  comment_count: 0,
  
  view_count: 0
}
  */
  return {
    likes: metricsData.like_count,
    shares: metricsData.share_count,
    comments: metricsData.comment_count,

    views: metricsData.view_count,
  };
}

// async function testPostToTIKTOK() {
//   const campaignPost = await CampaignContent.findById(
//     '681eabb7aa13500e4be18ca5'
//   );

//   if (!campaignPost) {
//     throw new Error('Campaign post not found');
//   }

//   const postId = await postToTiktok(campaignPost);
//   console.log('Post ID:', postId);
// }

// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     logger.info('Connected to MongoDB');
//   })
//   .then(() => {
//     testPostToTIKTOK();
//   })
//   .catch((error) => {
//     logger.error('Error connecting to MongoDB', error.message);
//   });

function wait(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
