import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';

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

// Circuit breaker & fast timeout for Redis operations so slow/unreachable network never blocks authentication
let redisFailCount = 0;
let redisDisabledUntil = 0;

function isRedisReady(): boolean {
  if (!redisClient) return false;
  return Date.now() >= redisDisabledUntil;
}

function handleRedisSuccess() {
  redisFailCount = 0;
}

function handleRedisError() {
  redisFailCount++;
  if (redisFailCount >= 2) {
    // Back off for 60 seconds so subsequent requests don't hang
    redisDisabledUntil = Date.now() + 60000;
  }
}

async function withRedisTimeout<T>(operation: () => Promise<T>, timeoutMs: number = 800): Promise<T | null> {
  if (!isRedisReady()) return null;
  let timer: NodeJS.Timeout;
  try {
    const timeoutPromise = new Promise<null>((resolve) => {
      timer = setTimeout(() => resolve(null), timeoutMs);
    });
    const result = await Promise.race([operation(), timeoutPromise]);
    if (result !== null) {
      handleRedisSuccess();
    } else {
      handleRedisError();
    }
    return result as T | null;
  } catch {
    handleRedisError();
    return null;
  } finally {
    clearTimeout(timer!);
  }
}

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

  if (redisClient && isRedisReady()) {
    withRedisTimeout(async () => {
      await redisClient!.set(`session:${accessToken}`, session, { ex: SESSION_EXPIRY_SECONDS });
      await redisClient!.sadd(`user_sessions:${userId}`, accessToken);
    }).catch(() => {});
  }
};

/**
 * Step 4: On every API call, validate session is active
 */
export const isValidToken = async (token: string): Promise<boolean> => {
  if (memoryBlacklist.has(token)) return false;

  const memSession = memorySessions.get(token);
  if (memSession) {
    return Boolean(memSession.is_active);
  }

  if (redisClient && isRedisReady()) {
    try {
      const isBlacklisted = await withRedisTimeout(() => redisClient!.get(`blacklist:${token}`));
      if (isBlacklisted) return false;

      const session = await withRedisTimeout(() => redisClient!.get<ActiveSession>(`session:${token}`));
      if (session) return session.is_active !== false;
    } catch {
      // fallback to memory/Supabase
    }
  }

  // Cross-runtime verification fallback:
  // If not explicitly recorded in local memory, cryptographically verify token signature with Supabase.
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseAnonKey) {
      const sb = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user }, error } = await sb.auth.getUser(token);
      if (!error && user) {
        return true;
      }
    }
  } catch {
    // Verification failed
  }

  return false;
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

  if (redisClient && isRedisReady()) {
    withRedisTimeout(async () => {
      const session = await redisClient!.get<ActiveSession>(`session:${token}`);
      if (session) {
        session.is_active = false;
        await redisClient!.set(`session:${token}`, session, { ex: SESSION_EXPIRY_SECONDS });
      }
      await redisClient!.set(`blacklist:${token}`, 'true', { ex: SESSION_EXPIRY_SECONDS });
    }).catch(() => {});
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

  if (redisClient && isRedisReady()) {
    withRedisTimeout(async () => {
      const tokens = await redisClient!.smembers(`user_sessions:${userId}`);
      for (const token of tokens) {
        await invalidateToken(token as string);
      }
    }).catch(() => {});
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

  if (redisClient && isRedisReady()) {
    withRedisTimeout(() => redisClient!.lpush('auth_events', logEntry)).catch(() => {});
  }
};
