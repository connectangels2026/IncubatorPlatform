import axios from 'axios';
import { supabase } from '@/backend/lib/supabase';

const API_BASE_URL = typeof window !== 'undefined' ? '/api/v1' : (process.env.NEXT_PUBLIC_API_URL || '/api/v1');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach Supabase JWT and org_id
apiClient.interceptors.request.use(
  async (config: any) => {
    try {
      let token: string | null = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          token = session.access_token;
        }
      } catch {
        // Ignore session read error
      }

      if (!token && typeof window !== 'undefined') {
        token =
          localStorage.getItem('access_token') ||
          localStorage.getItem('token') ||
          localStorage.getItem('sb-access-token');

        if (!token) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sb-') && (key.includes('-auth-token') || key.includes('access-token'))) {
              try {
                const val = JSON.parse(localStorage.getItem(key) || '{}');
                if (val.access_token) {
                  token = val.access_token;
                  break;
                }
              } catch {}
            }
          }
        }

        // If still no token, try to refresh from refresh-token endpoint
        if (!token) {
          try {
            const refreshRes = await fetch('/api/v1/auth/refresh-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            if (refreshRes.ok) {
              const rData = await refreshRes.json();
              if (rData?.session?.access_token) {
                const refreshedAccess = String(rData.session.access_token);
                token = refreshedAccess;
                localStorage.setItem('access_token', refreshedAccess);
                if (rData.session.refresh_token) {
                  await supabase.auth.setSession({
                    access_token: refreshedAccess,
                    refresh_token: String(rData.session.refresh_token),
                  }).catch(() => {});
                }
              }
            }
          } catch {}
        }
      }

      if (token) {
        if (!config.headers) config.headers = {};
        if (typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // Extract org_id from URL or localStorage
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const orgId = urlParams.get('org') || localStorage.getItem('org_id');

        if (orgId) {
          if (!config.headers) {
            config.headers = {};
          }
          if (!config.headers['x-org-id']) {
            config.headers['x-org-id'] = orgId;
          }

          // Add org_id as query parameter if not already present
          if (!config.params) {
            config.params = {};
          }
          if (!config.params.org_id) {
            config.params.org_id = orgId;
          }
        }
      }
    } catch {
      // Ignore session fetch error on public requests
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor for automatic error handling with silent token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (err: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (err) {
      prom.reject(err);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorMsg = String(error.response?.data?.error || error.message || '').toLowerCase();
    const isAuthExpired = status === 401 || errorMsg.includes('invalid token') || errorMsg.includes('session expired');

    // Attempt silent token refresh on 401 before logging out
    if (isAuthExpired && originalRequest && !originalRequest._retry && typeof window !== 'undefined') {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (newToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        let newAccessToken: string | null = null;
        try {
          const { data, error: refreshErr } = await supabase.auth.refreshSession();
          if (!refreshErr && data?.session?.access_token) {
            newAccessToken = data.session.access_token;
          }
        } catch {}

        if (!newAccessToken) {
          const rRes = await fetch('/api/v1/auth/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (rRes.ok) {
            const rData = await rRes.json();
            if (rData?.session?.access_token) {
              const refreshedAccess = String(rData.session.access_token);
              newAccessToken = refreshedAccess;
              localStorage.setItem('access_token', refreshedAccess);
              if (rData.session.refresh_token) {
                await supabase.auth.setSession({
                  access_token: refreshedAccess,
                  refresh_token: String(rData.session.refresh_token),
                }).catch(() => {});
              }
            }
          }
        }

        if (newAccessToken) {
          originalRequest.headers = originalRequest.headers || {};
          if (typeof originalRequest.headers.set === 'function') {
            originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
          }
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      } catch (refreshEx) {
        console.warn('Silent session refresh attempt failed:', refreshEx);
      } finally {
        isRefreshing = false;
      }

      processQueue(error, null);

      try {
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('org_id');
        localStorage.removeItem('org_founder_name');
        localStorage.removeItem('org_name');
        await supabase.auth.signOut().catch(() => {});
      } catch {}

      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/auth')) {
        const currentUrl = currentPath + window.location.search;
        window.location.href = `/login?expired=true&redirect=${encodeURIComponent(currentUrl)}`;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
