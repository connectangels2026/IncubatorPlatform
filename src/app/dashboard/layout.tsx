'use client';

import React from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
