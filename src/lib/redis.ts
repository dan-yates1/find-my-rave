import { Redis } from '@upstash/redis';

const getRedisClient = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Redis configuration missing');
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    retry: {
      retries: 3,
      backoff: (retryCount) => Math.min(Math.exp(retryCount) * 50, 1000),
    },
  });
};

export const redis = getRedisClient();

// Test the connection
redis.ping().then(() => {
  console.log('Successfully connected to Upstash Redis');
}).catch((error) => {
  console.error('Failed to connect to Upstash Redis:', error);
});