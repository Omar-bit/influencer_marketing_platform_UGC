import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from './secrets';
import logger from './logger';

class RedisCache {
  private static instance: Redis;
  private static isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        reconnectOnError: (err) => {
          logger.error('Redis reconnection error:', err);
          return true;
        },
        maxRetriesPerRequest: 3,
        enableAutoPipelining: true,
      });

      this.instance.on('connect', () => {
        logger.info('Redis connected');
        this.isConnected = true;
      });

      this.instance.on('error', (err) => {
        logger.error('Redis error:', err);
        this.isConnected = false;
      });

      this.instance.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });
    }

    return this.instance;
  }

  public static async useCache<T>(
    key: string,
    callback: () => Promise<T>,
    options: {
      expiry?: number;
      refresh?: boolean;
    } = {}
  ): Promise<T> {
    const {
      expiry = 3600, //  1 hour
      refresh = false,
    } = options;

    try {
      const redis = this.getInstance();

      if (refresh) {
        const freshValue = await callback();
        await redis.set(key, JSON.stringify(freshValue), 'EX', expiry);
        return freshValue;
      }

      // check cache first
      const cacheValue = await redis.get(key);
      if (cacheValue) {
        return JSON.parse(cacheValue);
      }

      // Fetch and cache if not in redis
      const freshValue = await callback();
      await redis.set(key, JSON.stringify(freshValue), 'EX', expiry);
      return freshValue;
    } catch (err) {
      logger.error('Cache operation error:', err);

      // refetch if cache operation fails
      try {
        return await callback();
      } catch (callbackErr) {
        logger.error('Callback execution failed:', callbackErr);
        throw callbackErr;
      }
    }
  }

  public static async invalidateCache(key: string): Promise<void> {
    const redis = this.getInstance();
    await redis.del(key);
  }

  public static isRedisConnected(): boolean {
    return this.isConnected;
  }
}

export default RedisCache;

// Usage example
/*
const data = await RedisCache.useCache('user:123', async () => {
  return await fetchUserFromDatabase(123);
});

// With custom expiry
const reports = await RedisCache.useCache('reports', 
  async () => await fetchReports(), 
  { expiry: 600 } // 10 minutes
);

// Force refresh
const latestData = await RedisCache.useCache('latest-data', 
  async () => await fetchLatestData(), 
  { refresh: true }
);

// Manually invalidate cache
await RedisCache.invalidateCache('user:123');

*/

//Dont forget to run Redis server before running this code
// docker run -p 6379:6379 -it redis/redis-stack-server:latest
