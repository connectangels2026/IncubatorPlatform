/**
 * API Client Interceptor
 * Implements Step 1, 2 & 3:
 * - Sends Authorization: Bearer [token]
 * - Auto-refreshes token silently 5 minutes before expiry
 * - Redirects to /login if refresh fails
 */

let inMemoryAccessToken: string | null = null;
let tokenExpiresAt: number = 0; // timestamp in ms

export const setAccessToken = (token: string, expiresInSeconds: number = 3600) => {
  inMemoryAccessToken = token;
  tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
    localStorage.setItem('token_expires_at', tokenExpiresAt.toString());
  }
};

export const getAccessToken = (): string | null => {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('access_token');
    const exp = localStorage.getItem('token_expires_at');
    if (stored && exp) {
      inMemoryAccessToken = stored;
      tokenExpiresAt = parseInt(exp, 10);
      return inMemoryAccessToken;
    }
  }
  return null;
};

export const clearTokens = () => {
  inMemoryAccessToken = null;
  tokenExpiresAt = 0;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expires_at');
  }
};

/**
 * Step 3: Silently refresh token if expiring within 5 minutes (300,000 ms)
 */
export const ensureFreshToken = async (): Promise<string | null> => {
  const token = getAccessToken();
  if (!token) return null;

  const fiveMinutesMs = 5 * 60 * 1000;
  const isExpiringSoon = tokenExpiresAt - Date.now() < fiveMinutesMs;

  if (!isExpiringSoon) {
    return token;
  }

  // Token is about to expire, refresh silently
  try {
    const res = await fetch('/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Refresh failed');

    const data = await res.json();
    if (data.session?.access_token) {
      setAccessToken(data.session.access_token, data.session.expires_in || 3600);
      return data.session.access_token;
    }
  } catch (err) {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return token;
};

/**
 * Intercepted fetch wrapper for all authenticated API calls
 */
export const apiClient = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = await ensureFreshToken();

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
