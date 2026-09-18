import { Redis } from '@upstash/redis';

/**
 * Upstash Redis token management
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface SessionData {
  userId: string;
  token: string;
  timestamp: number;
}

const SESSION_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Stores an active session token.
 */
export const storeActiveToken = async (userId: string, token: string) => {
  const sessionData: SessionData = {
    userId,
    token,
    timestamp: Date.now(),
  };
  
  await redis.set(`session:${token}`, sessionData, { ex: SESSION_EXPIRY_SECONDS });
};

/**
 * Validates if the token is active and not blacklisted.
 */
export const isValidToken = async (token: string): Promise<boolean> => {
  const isBlacklisted = await redis.get(`blacklist:${token}`);
  if (isBlacklisted) {
    return false;
  }
  
  const session = await redis.get(`session:${token}`);
  return !!session;
};

/**
 * Removes and blacklists a token on logout.
 */
export const invalidateToken = async (token: string) => {
  await redis.del(`session:${token}`);
  await redis.set(`blacklist:${token}`, 'true', { ex: SESSION_EXPIRY_SECONDS });
};

/**
 * Log auth events (dummy implementation, can also log to Redis or DB).
 */
export const logAuthEvent = async (event: 'login' | 'logout' | 'failed_attempt', userId?: string) => {
  console.log(`[AUTH EVENT]: ${event} - User: ${userId || 'unknown'} - Time: ${new Date().toISOString()}`);
  
  // Optional: store auth events in a Redis list
  const logEntry = {
    event,
    userId: userId || 'unknown',
    timestamp: new Date().toISOString(),
  };
  await redis.lpush('auth_events', logEntry);
};
