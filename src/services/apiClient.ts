import axios from 'axios';
import { supabase } from '@/backend/lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach Supabase JWT
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch {
      // Ignore session fetch error on public requests
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Handle unauthorized session
    }
    return Promise.reject(error);
  }
);

export default apiClient;
