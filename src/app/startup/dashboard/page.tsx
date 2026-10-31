'use client';

import React from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import StartupDashboard from '@/frontend/components/startup-dashboard/StartupDashboard';

export default function StartupDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F8FAFC]">
        <StartupDashboard />
      </div>
    </ProtectedRoute>
  );
}
