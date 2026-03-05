import { Request, Response } from 'express';
import { ElasticsearchService } from '../services/elasticsearch.service';
import User from '@models/user';
import InfluencerApplication from '@models/influencerApplication';
import logger from '@utils/logger';

// Helper function to calculate average rating for an influencer
async function calculateAverageRating(influencerId: string): Promise<number> {
  try {
    const applications = await InfluencerApplication.find({
      influencer: influencerId,
      status: 'accepted',
      'rating.rating': { $ne: null, $exists: true },
    });

    if (applications.length === 0) {
      return 0;
    }

    const totalRating = applications.reduce((sum, app) => {
      return sum + (app.rating?.rating || 0);
    }, 0);

    return parseFloat((totalRating / applications.length).toFixed(1));
  } catch (error) {
    logger.error(
      `Error calculating average rating for influencer ${influencerId}:`,
      error
    );
    return 0;
  }
}

export class RecommendationController {
  private elasticsearchService: ElasticsearchService;

  constructor() {
    this.elasticsearchService = ElasticsearchService.getInstance();
  }

  getInfluencerRecommendations = async (req: Request, res: Response) => {
    try {
      const {
        categories,
        minFollowers,
        maxFollowers,
        location,
        languages,
        platforms,
        minRating,
      } = req.query;

      const recommendations = await this.elasticsearchService.searchInfluencers(
        {
          categories: categories
            ? Array.isArray(categories)
              ? categories
              : [categories]
            : undefined,
          minFollowers: minFollowers
            ? parseInt(minFollowers as string)
            : undefined,
          maxFollowers: maxFollowers
            ? parseInt(maxFollowers as string)
            : undefined,
          location: location as string,
          languages: languages
            ? Array.isArray(languages)
              ? languages
              : [languages]
            : undefined,
          platforms: platforms
            ? Array.isArray(platforms)
              ? platforms
              : [platforms]
            : undefined,
          minRating: minRating ? parseFloat(minRating as string) : undefined,
        }
      );

      res.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      console.error('Error getting influencer recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get influencer recommendations',
      });
    }
  };

  getAllIndexedInfluencers = async (req: Request, res: Response) => {
    try {
      const influencers = await this.elasticsearchService.getAllInfluencers();
      res.json({
        success: true,
        data: influencers,
      });
    } catch (error) {
      console.error('Error getting all indexed influencers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get indexed influencers',
      });
    }
  };

  seedTestData = async (req: Request, res: Response) => {
    try {
      const testData = [
        {
          id: '1',
          name: 'John Doe',
          username: 'johndoe',
          bio: 'Fashion and lifestyle influencer',
          followers: 50000,
          engagement: 3.5,
          categories: ['fashion', 'lifestyle'],
          location: 'New York',
          languages: ['english'],
          averageLikes: 2000,
          averageComments: 150,
          createdAt: new Date(),
          platforms: ['instagram', 'tiktok'],
          rating: 4.5,
        },
        {
          id: '2',
          name: 'Jane Smith',
          username: 'janesmith',
          bio: 'Beauty and makeup expert',
          followers: 75000,
          engagement: 4.2,
          categories: ['beauty', 'makeup'],
          location: 'Los Angeles',
          languages: ['english', 'spanish'],
          averageLikes: 3500,
          averageComments: 250,
          createdAt: new Date(),
          platforms: ['instagram', 'youtube'],
          rating: 4.8,
        },
      ];

      for (const influencer of testData) {
        await this.elasticsearchService.indexInfluencer(influencer);
      }

      res.json({
        success: true,
        message: 'Test data seeded successfully',
      });
    } catch (error) {
      console.error('Error seeding test data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to seed test data',
      });
    }
  };

  indexAllInfluencers = async (req: Request, res: Response) => {
    try {
      logger.info('Starting to index all influencers...');
      const influencers = await User.find({ type: 'influencer' });
      logger.info(`Found ${influencers.length} influencers in the database`);

      let indexedCount = 0;
      for (const influencer of influencers) {
        try {
          // Get the highest engagement rate and followers count from social media accounts
          const highestEngagement = Math.max(
            ...(influencer.socialMedia?.map(
              (sm: any) => sm.engagementRate || 0
            ) || [0])
          );
          const highestFollowers = Math.max(
            ...(influencer.socialMedia?.map((sm: any) => sm.followers || 0) || [
              0,
            ])
          );
          const averageLikes = Math.max(
            ...(influencer.socialMedia?.map(
              (sm: any) => sm.likesCount || 0
            ) || [0])
          );

          // Get platforms from social media accounts
          const platforms =
            influencer.socialMedia?.map((sm: any) => sm.platform) || []; // Get average rating from all influencer applications
          const rating = await calculateAverageRating(
            influencer._id.toString()
          );

          // Filter out undefined values and ensure all categories are strings
          const categories: string[] = [
            influencer.primaryNiche,
            ...(influencer.secondaryNiches || []),
          ].filter(
            (category): category is string => typeof category === 'string'
          );

          // Ensure location is a string
          const location =
            typeof influencer.address?.city === 'string'
              ? influencer.address.city
              : '';

          const influencerDoc = {
            id: influencer._id.toString(),
            name: influencer.name,
            username: influencer.username || '',
            bio: influencer.bio || '',
            followers: highestFollowers,
            engagement: highestEngagement,
            categories,
            location,
            languages: influencer.spokenLanguages || [],
            averageLikes: averageLikes,
            averageComments: Math.floor(averageLikes * 0.1), // Estimate comments as 10% of likes
            createdAt: influencer.createdAt,
            platforms,
            rating,
          };

          logger.info(
            `Indexing influencer: ${influencer.name} (${influencer._id})`
          );
          await this.elasticsearchService.indexInfluencer(influencerDoc);
          indexedCount++;
        } catch (error) {
          logger.error(`Failed to index influencer ${influencer._id}:`, error);
        }
      }

      logger.info(
        `Successfully indexed ${indexedCount} out of ${influencers.length} influencers`
      );
      res.json({
        success: true,
        message: `Successfully indexed ${indexedCount} out of ${influencers.length} influencers`,
      });
    } catch (error) {
      logger.error('Error indexing influencers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to index influencers',
      });
    }
  };
}
