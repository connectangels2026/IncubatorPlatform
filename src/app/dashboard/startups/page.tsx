'use client';

import React from 'react';
import ProtectedRoute from '@/frontend/components/ProtectedRoute';
import { StartupsPage } from '@/frontend/components/startups/StartupsPage';

export default function StartupsDirectoryRoute() {
  return (
    <ProtectedRoute>
      <StartupsPage />
    </ProtectedRoute>
  );
}
