import { Redis } from '@upstash/redis';

/**
 * Upstash Redis session & token management
 * Fallback to in-memory store if Redis credentials are not configured yet.
 */

let redisClient: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// In-memory fallback for local development without env configured
const memorySessions = new Map<string, ActiveSession>();
const memoryBlacklist = new Set<string>();

export interface ActiveSession {
  user_id: string;
  access_token: string;
  refresh_token: string;
  created_at: string;
  expires_at: string;
  ip_address: string;
  user_agent: string;
  is_active: boolean;
}

const SESSION_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Step 4: On login, create session record
 */
export const storeActiveToken = async (
  userId: string,
  accessToken: string,
  refreshTokenStr: string = '',
  ip: string = '127.0.0.1',
  userAgent: string = 'Mozilla/5.0'
) => {
  const session: ActiveSession = {
    user_id: userId,
    access_token: accessToken,
    refresh_token: refreshTokenStr,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    ip_address: ip,
    user_agent: userAgent,
    is_active: true,
  };

  memorySessions.set(accessToken, session);

  if (redisClient) {
    try {
      await redisClient.set(`session:${accessToken}`, session, { ex: SESSION_EXPIRY_SECONDS });
      await redisClient.sadd(`user_sessions:${userId}`, accessToken);
    } catch (e) {
      console.warn('Redis unavailable, using in-memory session.');
    }
  }
};

/**
 * Step 4: On every API call, validate session is active
 */
export const isValidToken = async (token: string): Promise<boolean> => {
  if (memoryBlacklist.has(token)) return false;

  if (redisClient) {
    try {
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) return false;

      const session = await redisClient.get<ActiveSession>(`session:${token}`);
      if (session) return session.is_active !== false;
    } catch {
      // fallback to memory
    }
  }

  const memSession = memorySessions.get(token);
  return memSession ? memSession.is_active : true;
};

/**
 * Step 5: Single logout - Mark session as inactive (keep history for audit trail)
 */
export const invalidateToken = async (token: string) => {
  const memSession = memorySessions.get(token);
  if (memSession) {
    memSession.is_active = false;
  }
  memoryBlacklist.add(token);

  if (redisClient) {
    try {
      const session = await redisClient.get<ActiveSession>(`session:${token}`);
      if (session) {
        session.is_active = false;
        await redisClient.set(`session:${token}`, session, { ex: SESSION_EXPIRY_SECONDS });
      }
      await redisClient.set(`blacklist:${token}`, 'true', { ex: SESSION_EXPIRY_SECONDS });
    } catch (e) {
      console.warn('Redis error during invalidateToken');
    }
  }
};

/**
 * Step 5: Force all logouts - Mark all sessions as inactive for user
 */
export const invalidateAllUserSessions = async (userId: string) => {
  for (const session of memorySessions.values()) {
    if (session.user_id === userId) {
      session.is_active = false;
      memoryBlacklist.add(session.access_token);
    }
  }

  if (redisClient) {
    try {
      const tokens = await redisClient.smembers(`user_sessions:${userId}`);
      for (const token of tokens) {
        await invalidateToken(token as string);
      }
    } catch (e) {
      console.warn('Redis error during invalidateAllUserSessions');
    }
  }
};

/**
 * Log auth events for audit trail
 */
export const logAuthEvent = async (event: 'login' | 'logout' | 'failed_attempt', userId?: string) => {
  const logEntry = {
    event,
    userId: userId || 'unknown',
    timestamp: new Date().toISOString(),
  };

  if (redisClient) {
    try {
      await redisClient.lpush('auth_events', logEntry);
    } catch {}
  }
};
