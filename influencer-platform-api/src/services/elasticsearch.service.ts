import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
import logger from '@utils/logger';

dotenv.config();

interface InfluencerDocument {
  id: string;
  name: string;
  username: string;
  bio: string;
  followers: number;
  engagement: number;
  categories: string[];
  location: string;
  languages: string[];
  averageLikes: number;
  averageComments: number;
  createdAt: Date;
  platforms: string[];
  rating: number;
}

const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
  }
});

export class ElasticsearchService {
  private static instance: ElasticsearchService;
  private readonly indexName = 'influencers';

  private constructor() {
    this.initializeIndex();
  }

  public static getInstance(): ElasticsearchService {
    if (!ElasticsearchService.instance) {
      ElasticsearchService.instance = new ElasticsearchService();
    }
    return ElasticsearchService.instance;
  }

  private async initializeIndex() {
    try {
      logger.info('Initializing Elasticsearch index...');
      await this.createIndex();
      logger.info('Elasticsearch index initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Elasticsearch index:', error);
    }
  }

  async createIndex() {
    const exists = await elasticClient.indices.exists({ index: this.indexName });
    logger.info(`Index ${this.indexName} exists: ${exists}`);
    
    if (!exists) {
      logger.info(`Creating index ${this.indexName}...`);
      await elasticClient.indices.create({
        index: this.indexName,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text' },
              username: { type: 'keyword' },
              bio: { type: 'text' },
              followers: { type: 'long' },
              engagement: { type: 'float' },
              categories: { type: 'keyword' },
              location: { type: 'text' },
              languages: { type: 'keyword' },
              averageLikes: { type: 'long' },
              averageComments: { type: 'long' },
              createdAt: { type: 'date' },
              platforms: { type: 'keyword' },
              rating: { type: 'float' }
            }
          },
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1
          }
        }
      });
      logger.info(`Index ${this.indexName} created successfully`);
    } else {
      logger.info(`Deleting and recreating index ${this.indexName}...`);
      await elasticClient.indices.delete({ index: this.indexName });
      await this.createIndex();
    }
  }

  async indexInfluencer(influencer: InfluencerDocument) {
    try {
      logger.info(`Indexing influencer ${influencer.id} (${influencer.name})...`);
      const result = await elasticClient.index({
        index: this.indexName,
        document: influencer
      });
      logger.info(`Successfully indexed influencer ${influencer.id}`);
      return result;
    } catch (error) {
      logger.error(`Failed to index influencer ${influencer.id}:`, error);
      throw error;
    }
  }

  async getAllInfluencers() {
    try {
      logger.info('Fetching all influencers from Elasticsearch...');
      const response = await elasticClient.search<InfluencerDocument>({
        index: this.indexName,
        body: {
          query: {
            match_all: {}
          }
        }
      });
      logger.info(`Found ${response.hits.hits.length} influencers`);
      return response.hits.hits.map(hit => ({
        ...(hit._source as InfluencerDocument),
        score: hit._score
      }));
    } catch (error) {
      logger.error('Failed to fetch all influencers:', error);
      throw error;
    }
  }

  async searchInfluencers(query: any) {
    try {
      logger.info('Searching influencers with query:', query);
      const { categories, minFollowers, maxFollowers, location, languages, platforms, minRating } = query;
      
      const must: any[] = [];
      const should: any[] = [];
      
      if (categories && categories.length > 0) {
        should.push({ terms: { categories } });
      }
      
      if (minFollowers) {
        must.push({ range: { followers: { gte: minFollowers } } });
      }
      
      if (maxFollowers) {
        must.push({ range: { followers: { lte: maxFollowers } } });
      }
      
      if (location) {
        should.push({ match: { location } });
      }
      
      if (languages && languages.length > 0) {
        should.push({ terms: { languages } });
      }

      if (platforms && platforms.length > 0) {
        should.push({ terms: { platforms } });
      }

      if (minRating) {
        must.push({ range: { rating: { gte: minRating } } });
      }

      // Add default should conditions
      should.push(
        { range: { engagement: { gte: 0 } } },
        { range: { averageLikes: { gte: 0 } } }
      );

      const response = await elasticClient.search<InfluencerDocument>({
        index: this.indexName,
        body: {
          query: {
            bool: {
              must,
              should,
              minimum_should_match: should.length > 0 ? 1 : 0
            }
          },
          sort: [
            { rating: { order: 'desc' } },
            { engagement: { order: 'desc' } },
            { followers: { order: 'desc' } }
          ]
        }
      });

      logger.info(`Found ${response.hits.hits.length} matching influencers`);
      return response.hits.hits.map(hit => ({
        ...(hit._source as InfluencerDocument),
        score: hit._score
      }));
    } catch (error) {
      logger.error('Failed to search influencers:', error);
      throw error;
    }
  }
} 