'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useUnreadNotifications, useMarkNotificationRead } from '@/hooks/useMarketplace';
import { useSession } from 'next-auth/react';


export function NotificationBell() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: notifications } = useUnreadNotifications();
  const markRead = useMarkNotificationRead();

  const count = notifications?.length || 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (status === "unauthenticated") return null;

  const handleMarkAllRead = () => {
    markRead.mutate('all');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">Notifications</span>
            {count > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!notifications?.length ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => {
                        markRead.mutate(n.id);
                        setOpen(false);
                      }}
                      className="block"
                    >
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </Link>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
