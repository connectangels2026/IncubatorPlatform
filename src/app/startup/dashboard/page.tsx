'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import StartupDashboard from '@/frontend/components/startup-dashboard/StartupDashboard';
import { Loader2 } from 'lucide-react';

function StartupDashboardContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const [startupId, setStartupId] = useState<string | undefined>(queryId || undefined);

  useEffect(() => {
    if (queryId) {
      setStartupId(queryId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected_startup_id', queryId);
      }
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selected_startup_id');
      if (stored) {
        setStartupId(stored);
      }
    }
  }, [queryId]);

  return <StartupDashboard startupId={startupId} />;
}

export default function StartupDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full flex flex-col bg-[#F8FAFC]">
        <Suspense
          fallback={
            <div className="min-h-[400px] w-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          }
        >
          <StartupDashboardContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
