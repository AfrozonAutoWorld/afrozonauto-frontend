'use client';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminRequestManagement } from '@/views/AdminRequestManagement';

export default function AdminRequestsPage() {
  return (
    <ProtectedRoute>
      <AdminRequestManagement />
    </ProtectedRoute>
  );
}
