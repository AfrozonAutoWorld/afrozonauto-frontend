'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE =
  'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1200';

const PLACEHOLDER_BG = 'bg-[#BBD6DD]';

function thumbIndicesForMain(total: number, main: number, max: number): number[] {
  if (total <= 1) return [];
  return Array.from({ length: total }, (_, i) => i)
    .filter((i) => i !== main)
    .slice(0, max);
}

type ThumbSlotProps = {
  imageIndex: number | null;
  src: string | undefined;
  alt: string;
  roundedClass: string;
  className?: string;
  onSelect: (index: number) => void;
  overlay?: ReactNode;
};

function ThumbSlot({
  imageIndex,
  src,
  alt,
  roundedClass,
  className,
  onSelect,
  overlay,
}: ThumbSlotProps) {
  const interactive = imageIndex != null && src;

  return (
    <div
      className={cn(
        'flex overflow-hidden relative flex-1 min-w-0 min-h-[7rem]',
        PLACEHOLDER_BG,
        roundedClass,
        className,
      )}
    >
      {interactive ? (
        <button
          type="button"
          onClick={() => onSelect(imageIndex)}
          className="relative flex h-full min-h-[7rem] w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#417482] focus-visible:ring-offset-2"
          aria-label={`Show photo ${imageIndex + 1}`}
        >
          <img
            src={src}
            alt=""
            className="object-cover absolute inset-0 w-full h-full"
          />
          <span className="sr-only">{alt}</span>
        </button>
      ) : (
        <div className="h-full min-h-[7rem] w-full bg-[#BBD6DD]/80" aria-hidden />
      )}
      {overlay}
    </div>
  );
}

type VehiclePhotosModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  alt: string;
  index: number;
  onIndexChange: (i: number) => void;
};

function VehiclePhotosModal({
  open,
  onOpenChange,
  images,
  alt,
  index,
  onIndexChange,
}: VehiclePhotosModalProps) {
  const n = images.length;
  const safeIndex = n ? ((index % n) + n) % n : 0;
  const hasMany = n > 1;

  const goPrev = useCallback(() => {
    if (n < 2) return;
    onIndexChange((safeIndex - 1 + n) % n);
  }, [n, onIndexChange, safeIndex]);

  const goNext = useCallback(() => {
    if (n < 2) return;
    onIndexChange((safeIndex + 1) % n);
  }, [n, onIndexChange, safeIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, goPrev, goNext]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'fixed inset-0 left-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col border-0 bg-black/92 p-0 shadow-none sm:max-w-none sm:rounded-none',
          'data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0',
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">
          {alt} — photo {safeIndex + 1} of {n}
        </DialogTitle>

        <div className="flex gap-2 justify-end items-center px-4 pt-4 shrink-0">
          <p className="mr-auto text-sm font-medium font-body text-white/90">
            {n ? `${safeIndex + 1} / ${n}` : ''}
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex justify-center items-center w-10 h-10 text-white rounded-full transition-colors bg-white/10 hover:bg-white/20"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex relative flex-1 justify-center items-center px-4 pt-2 pb-8 min-h-0">
          {n > 0 && (
            <img
              src={images[safeIndex]}
              alt={`${alt} — ${safeIndex + 1}`}
              className="max-h-[min(78dvh,100%)] max-w-full object-contain"
            />
          )}

          {hasMany && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="flex absolute left-2 top-1/2 justify-center items-center w-11 h-11 text-white rounded-full backdrop-blur-sm transition-colors -translate-y-1/2 bg-white/15 hover:bg-white/25 md:left-4"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex absolute right-2 top-1/2 justify-center items-center w-11 h-11 text-white rounded-full backdrop-blur-sm transition-colors -translate-y-1/2 bg-white/15 hover:bg-white/25 md:right-4"
                aria-label="Next photo"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}
        </div>

        {hasMany && (
          <div className="flex gap-2 justify-center px-4 pb-6 shrink-0">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onIndexChange(i)}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  i === safeIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60',
                )}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type VehicleImageGalleryProps = {
  images: string[];
  alt: string;
};

export function VehicleImageGallery({ images, alt }: VehicleImageGalleryProps) {
  const list = useMemo(() => {
    const filtered = images.filter(Boolean);
    return filtered.length ? filtered : [FALLBACK_IMAGE];
  }, [images]);

  const [mainIndex, setMainIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  useEffect(() => {
    setMainIndex((i) => Math.min(i, Math.max(0, list.length - 1)));
  }, [list.length]);

  const thumbIdx = useMemo(
    () => thumbIndicesForMain(list.length, mainIndex, 4),
    [list.length, mainIndex],
  );

  const openModalAt = useCallback((i: number) => {
    setModalIndex(i);
    setModalOpen(true);
  }, []);

  const mainSrc = list[mainIndex] ?? FALLBACK_IMAGE;
  const showThumbs = list.length > 1;
  const showViewAll = list.length > 1;

  const slot = (position: 0 | 1 | 2 | 3) => {
    const idx = thumbIdx[position];
    return idx != null ? list[idx] : undefined;
  };

  const viewAllButton = (
    <div className="flex absolute inset-0 z-10 justify-center items-end pb-3 pointer-events-none md:pb-4">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openModalAt(mainIndex);
        }}
        className="pointer-events-auto inline-flex items-center gap-1 rounded-lg bg-white py-2 pb-2.5 pl-2 pr-3 font-body text-sm font-medium leading-5 text-[#546881] shadow-sm transition-opacity hover:opacity-95"
      >
        <ImageIcon className="h-4 w-4 shrink-0 text-[#546881]" strokeWidth={1.5} />
        View all photos
      </button>
    </div>
  );

  /* ——— Single image ——— */
  if (!showThumbs) {
    return (
      <div
        className={cn(
          'overflow-hidden relative w-full rounded-2xl',
          PLACEHOLDER_BG,
        )}
      >
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
          <img
            src={mainSrc}
            alt={alt}
            className="object-cover absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    );
  }

  /* ——— Two images: main + one column ——— */
  if (list.length === 2) {
    const otherIdx = thumbIdx[0];
    return (
      <>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
          <div
            className={cn(
              'relative min-h-[12rem] w-full overflow-hidden rounded-2xl lg:h-full lg:min-h-[16rem] lg:flex-[1.1] lg:min-w-0 lg:rounded-l-2xl lg:rounded-r-none',
              PLACEHOLDER_BG,
            )}
          >
            <button
              type="button"
              onClick={() => openModalAt(mainIndex)}
              className="relative block h-full min-h-[12rem] w-full lg:min-h-[16rem] lg:h-full"
            >
              <img
                src={mainSrc}
                alt={alt}
                className="object-cover absolute inset-0 w-full h-full"
              />
            </button>
          </div>
          <div className="flex min-h-[12rem] flex-1 flex-col min-w-0 lg:min-h-0">
            {otherIdx != null && (
              <ThumbSlot
                imageIndex={otherIdx}
                src={list[otherIdx]}
                alt={alt}
                roundedClass="rounded-2xl lg:rounded-l-none lg:rounded-r-2xl"
                onSelect={setMainIndex}
                overlay={showViewAll ? viewAllButton : undefined}
              />
            )}
          </div>
        </div>
        <VehiclePhotosModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          images={list}
          alt={alt}
          index={modalIndex}
          onIndexChange={setModalIndex}
        />
      </>
    );
  }

  /* ——— 3+ images: main + middle column + right column (Figma layout) ——— */
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6 h-[420px]">
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-2xl lg:h-full lg:min-h-[16rem] lg:flex-[1.1] lg:min-w-0 lg:rounded-l-2xl lg:rounded-r-none',
            PLACEHOLDER_BG,
          )}
        >
          <button
            type="button"
            onClick={() => openModalAt(mainIndex)}
            className="relative block aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[16rem]"
          >
            <img
              src={mainSrc}
              alt={alt}
              className="object-cover absolute inset-0 w-full h-full"
            />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 sm:flex-row lg:h-full lg:min-h-[16rem] lg:gap-4">
          {/* Middle column */}
          <div className="flex flex-col flex-1 gap-4 min-w-0 min-h-0">
            <ThumbSlot
              imageIndex={thumbIdx[0] ?? null}
              src={slot(0)}
              alt={alt}
              roundedClass="rounded-2xl lg:rounded-none"
              onSelect={setMainIndex}
            />
            <ThumbSlot
              imageIndex={thumbIdx[1] ?? null}
              src={slot(1)}
              alt={alt}
              roundedClass="rounded-2xl lg:rounded-none"
              onSelect={setMainIndex}
            />
          </div>

          {/* Right column */}
          <div className="flex flex-col flex-1 gap-4 min-w-0 min-h-0">
            <ThumbSlot
              imageIndex={thumbIdx[2] ?? null}
              src={slot(2)}
              alt={alt}
              roundedClass="rounded-2xl lg:rounded-tl-none lg:rounded-tr-2xl lg:rounded-bl-none lg:rounded-br-none"
              onSelect={setMainIndex}
            />
            <ThumbSlot
              imageIndex={thumbIdx[3] ?? null}
              src={slot(3)}
              alt={alt}
              roundedClass="rounded-2xl lg:rounded-br-2xl lg:rounded-tl-none lg:rounded-tr-none lg:rounded-bl-none"
              onSelect={setMainIndex}
              overlay={showViewAll ? viewAllButton : undefined}
            />
          </div>
        </div>
      </div>

      <VehiclePhotosModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        images={list}
        alt={alt}
        index={modalIndex}
        onIndexChange={setModalIndex}
      />
    </>
  );
}
