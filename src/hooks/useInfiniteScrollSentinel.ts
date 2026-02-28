'use client';

import { useEffect, useRef } from 'react';

/**
 * Observe a sentinel element and call loadMore when it enters the viewport.
 * Use at the end of an infinite list so "load more" triggers on scroll.
 */
export function useInfiniteScrollSentinel(
  loadMore: () => void,
  enabled: boolean,
  options?: { rootMargin?: string; threshold?: number }
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { rootMargin = '300px 0px', threshold = 0 } = options ?? {};

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        loadMore();
      },
      { root: null, rootMargin, threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, enabled, rootMargin, threshold]);

  return sentinelRef;
}
