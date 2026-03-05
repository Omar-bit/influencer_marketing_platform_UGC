import Campaign from '@models/campaign';
import CampaignContent, { ICampaignContent } from '@models/campaignContent';
import User from '@models/user';
import { postToInstagram } from './instagramPublishingService';
import { postToTiktok } from './tiktokPublishingService';

export async function postToSocialMedia(content: ICampaignContent) {
  const socialMediaPlatforms = content.socialMediaPlatforms;
  socialMediaPlatforms.forEach(async (platform) => {
    switch (platform) {
      case 'instagram':
        await postToInstagram(content);
        break;
      case 'tiktok':
        await postToTiktok(content);
        break;
      case 'youtube':
        //unsupported for now
        console.log('YouTube posting is not supported yet.');
        break;
      case 'facebook':
        //unsupported for now
        console.log('Facebook posting is not supported yet.');
        break;
      default:
        console.log(`Unsupported platform: ${platform}`);
    }
  });
  content.status = 'posted';
  await content.save();
  return content;
}
