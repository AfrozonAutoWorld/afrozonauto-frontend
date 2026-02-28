'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export interface GradientPageBarProps {
  /** Label for the back button (e.g. "Back to search"). If omitted, no back button is shown. */
  backLabel?: string;
  /** Custom back handler. Defaults to router.back() */
  onBack?: () => void;
  /** Optional content on the right (e.g. page title or breadcrumb) */
  rightContent?: ReactNode;
  /** Extra class names for the outer gradient container */
  className?: string;
}

export function GradientPageBar({
  backLabel,
  onBack,
  rightContent,
  className = '',
}: GradientPageBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div
      className={`bg-gradient-to-r from-gray-900 to-emerald-900 ${className}`}
      role="banner"
    >
      <div className="flex flex-col gap-3 px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
        {backLabel ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex gap-2 items-center text-sm font-medium text-gray-200 transition-colors hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden />
            {backLabel}
          </button>
        ) : (
          <div className={rightContent != null ? 'flex-1' : undefined} />
        )}
        {rightContent != null ? (
          <div className="text-sm text-emerald-100 truncate sm:text-right">
            {rightContent}
          </div>
        ) : null}
      </div>
    </div>
  );
}
