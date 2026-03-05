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

  const influencerInstagram = influencer.socialMedia?.find(
    (platform: any) => platform.platform === 'instagram'
  );
  if (!influencerInstagram) throw new Error('Instagram account not found');

  return {
    accessToken: influencerInstagram.accessToken as string,
    userId: influencerInstagram.pageId || influencerInstagram.userId,
  };
}

async function createMediaContainers(
  contentAssets: string[],
  influencerIgUserId: string,
  influencerIgAccessToken: string,
  isCarrousel: boolean,
  caption: string = ''
): Promise<string[]> {
  const containerIds: string[] = [];

  for (const contentAsset of contentAssets) {
    console.log('contentAsset:', contentAsset);

    const url = `https://graph.instagram.com/v22.0/${influencerIgUserId}/media`;
    const media_type =
      contentAsset.split('.').pop() === 'mp4' ? 'video' : 'image';
    const asset_url = contentAsset;

    let params: any = {
      caption,
      access_token: influencerIgAccessToken,
      is_carousel_item: isCarrousel,
    };

    if (media_type === 'video') {
      params.video_url = asset_url;
      params.media_type = 'REELS';
    } else {
      params.image_url = asset_url;
    }

    const response = await axios.post(url, params);
    console.log('Container res:', response.data);

    if (response.status === 200) {
      containerIds.push(response.data.id);
    }
  }

  return containerIds;
}

async function createCarousel(
  containerIds: string[],
  influencerIgUserId: string,
  influencerIgAccessToken: string,
  caption: string,
  tags: string
): Promise<string | undefined> {
  const carrouselUrl = `https://graph.instagram.com/v22.0/${influencerIgUserId}/media`;
  const carrouselParams = {
    caption: `${caption} ${tags}`,
    access_token: influencerIgAccessToken,
    media_type: 'CAROUSEL',
    children: containerIds.join(','),
  };

  console.log('carrousel params:', carrouselParams);
  console.log('carrousel url:', carrouselUrl);

  let triesCarrousel = 0;
  let carrouselID: string | undefined = undefined;

  while (!carrouselID && triesCarrousel < 30) {
    triesCarrousel++;
    await wait(5000);
    try {
      const carrouselResponse = await axios.post(carrouselUrl, carrouselParams);
      console.log('carrousel res:', carrouselResponse.data);
      console.log('try' + triesCarrousel);

      if (carrouselResponse.status === 200) {
        carrouselID = carrouselResponse.data.id;
      }
    } catch (error: any) {
      console.log('Error creating carrousel:', error.response.data);
    }
  }

  return carrouselID;
}

async function publishContent(
  contentId: string,
  influencerIgUserId: string,
  influencerIgAccessToken: string
): Promise<string | undefined> {
  const publishUrl = `https://graph.instagram.com/v22.0/${influencerIgUserId}/media_publish`;
  const publishParams = {
    creation_id: contentId,
  };

  console.log('publish params:', publishParams);
  console.log('publish url:', publishUrl);
  console.log('waiting for content to be ready...');

  let isPublished = false;
  let tries = 0;

  while (!isPublished && tries < 30) {
    tries++;
    const statusres = await axios.get(
      `https://graph.instagram.com/${publishParams.creation_id}?fields=status_code&access_token=${influencerIgAccessToken}`
    );
    console.log('statusres:', statusres.data.status_code);
    console.log('try' + tries);
    await wait(5000);

    if (
      statusres.data.status_code.toLowerCase() === 'completed' ||
      statusres.data.status_code.toLowerCase() === 'finished'
    ) {
      try {
        const publishResponse = await axios.post(publishUrl, publishParams, {
          headers: {
            Authorization: `Bearer ${influencerIgAccessToken}`,
          },
        });

        console.log('Publish response:', publishResponse.data);
        if (publishResponse.status === 200) {
          isPublished = true;
          console.log('Post published successfully:', publishResponse.data);

          return publishResponse.data.id;
        }
      } catch (error: any) {
        console.log('Error publishing:', error.response.data);
      }
    }
  }

  return undefined;
}

export async function postToInstagram(campaignPost: ICampaignContent) {
  try {
    const { accessToken, userId } = await validateAndGetInfluencerData(
      campaignPost
    );

    const isCarrousel = campaignPost.contentAssets.length > 1;
    const caption = `${campaignPost.title}\n\n${campaignPost.description}`;
    const tags = campaignPost.tags.map((tag) => `#${tag}`).join(' ');

    const containerIds = await createMediaContainers(
      campaignPost.contentAssets,
      userId,
      accessToken,
      isCarrousel,
      caption
    );

    console.log('containerIds:', containerIds);
    if (containerIds.length === 0) {
      throw new Error('No media containers created');
    }

    let contentIdToPublish: string;
    if (containerIds.length > 1) {
      const carouselId = await createCarousel(
        containerIds,
        userId,
        accessToken,
        caption,
        tags
      );

      if (!carouselId) {
        throw new Error('Failed to create carousel');
      }

      contentIdToPublish = carouselId;
    } else {
      contentIdToPublish = containerIds[0];
    }
    const publishResponse = await publishContent(
      contentIdToPublish,
      userId,
      accessToken
    );
    if (!publishResponse) {
      throw new Error('Failed to publish content');
    }
    const posts = campaignPost.posts || [];
    posts.push({
      platform: 'instagram',
      postId: publishResponse,
    });

    campaignPost.posts = posts;
    await campaignPost.save();
    return publishResponse;
  } catch (error: any) {
    console.error('Error posting to Instagram:', error.message);
  }
}
export async function getInstagramMetrics(postId: string, accessToken: string) {
  //ig_reels_video_view_total_time,ig_reels_avg_watch_time,
  //https://graph.instagram.com/18036406553319191/insights?metric=shares,comments,likes,saved,total_interactions,reach,views
  const metricsResponse = await axios.get(
    `https://graph.instagram.com/${postId}/insights?metric=shares,comments,likes,saved,total_interactions,reach,views`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  // console.log('metricsResponse:', metricsResponse.data);
  /*  
   {
  data: [
    {
      name: 'shares',
      period: 'lifetime',
      values: [Array],
      title: 'Partages',
      description: 'Le nombre de partages de votre reel.',
      id: '18036406553319191/insights/shares/lifetime'
    },
    {
      name: 'comments',
      period: 'lifetime',
      values: [Array],
      title: 'Commentaires',
      description: 'Le nombre de commentaires sur votre reel.',
      id: '18036406553319191/insights/comments/lifetime'
    },
    {
      name: 'likes',
      period: 'lifetime',
      values: [Array],
      title: 'J’aime',
      description: 'Le nombre de J’aime sur votre reel.',
      id: '18036406553319191/insights/likes/lifetime'
    },
    {
      name: 'saved',
      period: 'lifetime',
      values: [Array],
      title: 'Enregistré',
      description: 'Le nombre d’enregistrements de votre reel.',
      id: '18036406553319191/insights/saved/lifetime'
    },
    {
      name: 'total_interactions',
      period: 'lifetime',
      values: [Array],
      title: 'Interactions avec les reels',
      description: 'Le nombre de J’aime, d’enregistrements, de commentaires et de partages de vos reels, moins le nombre de Je n’aime plus, d’enregistrements annulés et de commentaires supprimés.',
      id: '18036406553319191/insights/total_interactions/lifetime'
    },
    {
      name: 'reach',
      period: 'lifetime',
      values: [Array],
      title: 'Comptes touchés',
      description: 'Le nombre de comptes uniques qui ont vu ce reel au moins une fois. La couverture est différente des impressions, qui peuvent inclure plusieurs vues de votre reel par les mêmes comptes. Cet indicateur est une estimation.',
      id: '18036406553319191/insights/reach/lifetime'
    },
    {
      name: 'views',
      period: 'lifetime',
      values: [Array],
      title: 'Vues',
      description: 'Nombre de fois que votre reel a été lu ou affiché',
      id: '18036406553319191/insights/views/lifetime'
    }
  ]
}
  */
  return {
    shares: metricsResponse.data.data[0].values[0].value,
    comments: metricsResponse.data.data[1].values[0].value,
    likes: metricsResponse.data.data[2].values[0].value,
    saved: metricsResponse.data.data[3].values[0].value,
    total_interactions: metricsResponse.data.data[4].values[0].value,
    reach: metricsResponse.data.data[5].values[0].value,
    views: metricsResponse.data.data[6].values[0].value,
  };
}

// getInstagramMetrics(
//   '18036406553319191',
//   'IGAAHuAMe2uzdBZAE56Y2UzLWtIZAnJYSW5FQ2xKTUx3ZA19rMjI5c3FtWVpQZAHU1a2s1azI5YXYySUg2czBGMTA0YVdQTVBSVmhaRUxBcFZAfY2NvY2t3UUx1WlJPMmFiZA0tuanJrZAkNUWU90enhab29ybE5n'
// )
//   .then((data) => {
//     console.log('Instagram metrics:', data);
//   })
//   .catch((error) => {
//     console.error('Error fetching Instagram metrics:', error.message);
//   });

// async function testPostToIG() {
//   const campaignPost = await CampaignContent.findById(
//     '681eabb7aa13500e4be18ca5'
//   );

//   if (!campaignPost) {
//     throw new Error('Campaign post not found');
//   }

//   const postId = await postToInstagram(campaignPost);
//   console.log('Post ID:', postId);
// }

// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     logger.info('Connected to MongoDB');
//   })
//   .then(() => {
//     testPostToIG();
//   })
//   .catch((error) => {
//     logger.error('Error connecting to MongoDB', error.message);
//   });

function wait(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
