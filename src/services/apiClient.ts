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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
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

// Response interceptor for automatic error handling
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    const status = error.response?.status;
    const errorMsg = String(error.response?.data?.error || error.message || '').toLowerCase();
    const isAuthExpired = status === 401 || errorMsg.includes('invalid token') || errorMsg.includes('session expired');

    if (isAuthExpired && typeof window !== 'undefined') {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('org_id');
        localStorage.removeItem('org_founder_name');
        localStorage.removeItem('org_name');
        supabase.auth.signOut().catch(() => {});
      } catch {}

      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
