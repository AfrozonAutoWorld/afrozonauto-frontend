'use client';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Dashboard } from '@/views/Dashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
