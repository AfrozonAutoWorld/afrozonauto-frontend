'use client';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminDashboard } from '@/views/AdminDashboard';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
