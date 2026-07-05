import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis || 
  (process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis()); // Connects to localhost:6379 by default if no URL

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
