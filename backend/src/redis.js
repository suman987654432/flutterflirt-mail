import Redis from 'ioredis';
import { config } from './config.js';

let redisClient = null;
let isRedisConnected = false;

// Resilient in-memory fallback cache if Redis is ever restarting or disconnected
const memoryFallbackCache = new Map();

try {
  redisClient = new Redis({
    host: config.redis?.host || 'redis',
    port: config.redis?.port || 6379,
    password: config.redis?.password || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 10) return 5000;
      return Math.min(times * 500, 2000);
    },
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log(`[Redis Cache] Connected to ${config.redis?.host || 'redis'}:${config.redis?.port || 6379}`);
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    // Keep log clean and non-crashing
    console.warn(`[Redis Cache Notice]: ${err.message}. Seamlessly using in-memory cache.`);
  });

  redisClient.on('close', () => {
    isRedisConnected = false;
  });

  redisClient.connect().catch((err) => {
    console.warn(`[Redis Cache Init]: Initial connect (${err.message}). In-memory fallback active.`);
  });
} catch (err) {
  console.warn('[Redis Cache Client Error]:', err.message);
}

/**
 * Universal Cache Interface (Redis Primary + Memory Secondary)
 */
export const cache = {
  async get(key) {
    if (isRedisConnected && redisClient) {
      try {
        const val = await redisClient.get(key);
        if (val) {
          return JSON.parse(val);
        }
      } catch (err) {
        // Fallback to memory
      }
    }
    const mem = memoryFallbackCache.get(key);
    if (!mem) return null;
    if (Date.now() > mem.expiresAt) {
      memoryFallbackCache.delete(key);
      return null;
    }
    return mem.data;
  },

  async set(key, value, ttlSeconds = 1800) {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      } catch (err) {
        // Fallback to memory
      }
    }
    if (memoryFallbackCache.size > 300) {
      const oldestKey = memoryFallbackCache.keys().next().value;
      if (oldestKey) memoryFallbackCache.delete(oldestKey);
    }
    memoryFallbackCache.set(key, {
      data: value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
    });
  },

  async del(key) {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.del(key);
      } catch (err) {}
    }
    memoryFallbackCache.delete(key);
  },

  async delPattern(pattern) {
    if (isRedisConnected && redisClient) {
      try {
        const stream = redisClient.scanStream({ match: pattern, count: 50 });
        stream.on('data', (keys) => {
          if (keys && keys.length > 0) {
            const pipeline = redisClient.pipeline();
            keys.forEach((k) => pipeline.del(k));
            pipeline.exec().catch(() => {});
          }
        });
      } catch (err) {}
    }
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const k of memoryFallbackCache.keys()) {
      if (regex.test(k)) {
        memoryFallbackCache.delete(k);
      }
    }
  },

  isConnected() {
    return isRedisConnected;
  },
};

export default cache;
