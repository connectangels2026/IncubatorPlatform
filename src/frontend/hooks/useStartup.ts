'use client';

import { useEffect, useTransition, useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { supabase } from '@/backend/lib/supabase';
import { apiClient } from '@/services/apiClient';

interface UseStartupOptions {
  columns?: string[];
  initialData?: any;
  enabled?: boolean;
}

const fetcher = async (url: string) => {
  const res = await apiClient.get(url);
  if (res.data?.success && res.data?.data) {
    return res.data.data;
  }
  if (res.data?.startup) {
    return {
      ...res.data.startup,
      application: res.data.application,
      organization: res.data.startup.organization || res.data.organization,
      has_assigned_dashboard: res.data.has_assigned_dashboard ?? true,
    };
  }
  return res.data;
};

export function useStartup(id: string = 'me', options: UseStartupOptions = {}) {
  const { columns, initialData, enabled = true } = options;

  const queryKey = id ? `/startups/${id}` : null;
  const urlWithColumns = queryKey && columns && columns.length > 0
    ? `${queryKey}?columns=${columns.join(',')}`
    : queryKey;

  const { data: startup, error, isLoading, isValidating, mutate } = useSWR(
    enabled && queryKey ? urlWithColumns : null,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const startupId = startup?.id || (id !== 'me' ? id : null);

  // Supabase Realtime synchronization across open tabs and roles
  useEffect(() => {
    if (!startupId) return;

    // Use a unique channel topic to prevent collisions between duplicate mounts / StrictMode
    const channelName = `startup-realtime-${startupId}-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'startups',
          filter: `id=eq.${startupId}`,
        },
        (payload: any) => {
          if (payload?.new) {
            mutate((prev: any) => ({ ...prev, ...payload.new }), false);
            // Invalidate global caches
            if (id === 'me') {
              globalMutate('/startups/me', (prev: any) => ({ ...prev, ...payload.new }), false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [startupId, mutate, id]);

  /**
   * Optimistic update function saving directly to startups table
   */
  const updateStartupData = async (fields: Record<string, any>) => {
    setSaveSuccess(false);
    setSaveError(null);

    const prevData = startup;

    // Optimistic update
    mutate((current: any) => ({ ...current, ...fields }), false);

    try {
      const endpoint = id && id !== 'me' ? `/startups/${id}` : '/startups/me';
      const res = await apiClient.put(endpoint, fields);

      if (res.data?.success || res.status === 200) {
        const updated = res.data?.data || res.data?.startup || fields;
        mutate((current: any) => ({ ...current, ...updated }), true);

        // Also update any global startup query keys
        if (startupId) {
          globalMutate(`/startups/${startupId}`, (curr: any) => ({ ...curr, ...updated }), false);
        }
        globalMutate('/startups/me', (curr: any) => ({ ...curr, ...updated }), false);

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        return { success: true, data: updated };
      } else {
        throw new Error(res.data?.error || 'Failed to save changes');
      }
    } catch (err: any) {
      // Rollback on failure
      mutate(prevData, false);
      const msg = err.response?.data?.error || err.message || 'Failed to save changes';
      setSaveError(msg);
      throw new Error(msg);
    }
  };

  return {
    startup,
    isLoading: isLoading && !startup,
    isValidating,
    error,
    saveError,
    saveSuccess,
    isSaving: isPending,
    updateStartup: updateStartupData,
    refresh: () => mutate(),
  };
}
