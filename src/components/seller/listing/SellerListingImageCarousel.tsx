'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Car } from 'lucide-react';

type SellerListingImageCarouselProps = {
  urls: string[];
  alt: string;
};

export function SellerListingImageCarousel({ urls, alt }: SellerListingImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const safe = urls.length > 0 ? urls : [];
  const current = safe[index] ?? null;
  const count = safe.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (count <= 1) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  if (count === 0) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-2xl bg-gray-100 aspect-[16/10]"
        role="img"
        aria-label="No photos"
      >
        <Car className="h-16 w-16 text-gray-300" strokeWidth={1.25} aria-hidden />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100 aspect-[16/10]">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element -- listing URLs come from multiple hosts (Cloudinary, etc.)
          <img
            src={current}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        ) : null}
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : null}
      </div>
      {count > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Photo carousel">
          {safe.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1} of ${count}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-[#0D7A4A]' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
