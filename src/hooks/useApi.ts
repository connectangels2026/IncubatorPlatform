'use client';

import { useAuth } from '@/frontend/context/AuthContext';
import apiClient from '@/services/apiClient';

export function useApi() {
  const { user, session } = useAuth();

  return {
    client: apiClient,
    user,
    isAuthenticated: !!user,
    token: session?.access_token,
  };
}

export default useApi;
