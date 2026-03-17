'use client';

import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const { status } = useSession();
  if (status === 'unauthenticated') return null;

  return (
    <button
      type="button"
      className="relative p-2 text-gray-400 cursor-default"
      aria-label="Notifications temporarily unavailable"
      disabled
    >
      <Bell className="w-5 h-5" />
    </button>
  );
}
