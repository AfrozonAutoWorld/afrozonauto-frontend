'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';

const labelBase = 'font-body text-sm font-medium leading-5 text-[#414651]';
const inputBase =
  'w-full h-11 px-3.5 py-2.5 font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 focus:border-[#0D7A4A]';
const textareaBase =
  'w-full min-h-[92px] px-3.5 py-2.5 font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 focus:border-[#0D7A4A] resize-y';

const PHOTO_SLOTS: { key: string; label: string; required: boolean }[] = [
  { key: 'front', label: 'Front exterior', required: true },
  { key: 'rear', label: 'Rear exterior', required: true },
  { key: 'driver', label: 'Driver side', required: true },
  { key: 'interior', label: 'Interior/Dashboard', required: true },
  { key: 'passenger', label: 'Passenger side', required: false },
  { key: 'engine', label: 'Engine bay', required: false },
  { key: 'odometer', label: 'Odometer', required: false },
  { key: 'damage', label: 'Any damage', required: false },
  { key: 'extra', label: 'Extra photo', required: false },
];

const MIN_PHOTOS = 4;

function PhotoSlot({
  slot,
  hasPhoto,
  previewUrl,
  onPick,
  className = '',
}: Readonly<{
  slot: (typeof PHOTO_SLOTS)[number];
  hasPhoto: boolean;
  previewUrl: string | null;
  onPick: () => void;
  className?: string;
}>) {
  const isRequired = slot.required;
  return (
    <button
      type="button"
      onClick={onPick}
      className={`
        relative flex flex-col justify-center items-center p-4 sm:p-6 gap-2 sm:gap-4 rounded-2xl
        bg-[#F0F2F5] transition-colors hover:bg-[#E8EAED] overflow-hidden
        ${isRequired ? 'border border-dashed border-[#D97706]' : 'border border-dashed border-[#546881]'}
        ${className}
      `}
    >
      {isRequired && (
        <span className="absolute left-2 top-2 z-10 px-2.5 py-1 rounded-full bg-[#D97706] font-body text-[10px] font-bold leading-3 text-white">
          Required
        </span>
      )}
      {hasPhoto && previewUrl ? (
        <span className="absolute inset-0 block w-full h-full">
          <img
            src={previewUrl}
            alt={slot.label}
            className="w-full h-full object-cover rounded-2xl"
          />
        </span>
      ) : null}
      <div
        className={`flex flex-col justify-center items-center gap-1.5 relative z-[1] ${hasPhoto && previewUrl ? 'absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 hover:opacity-100 transition-opacity' : ''}`}
      >
        {hasPhoto && previewUrl && (
          <span className="font-body text-xs text-white font-medium">Change photo</span>
        )}
        {hasPhoto && !previewUrl && (
          <span className="font-body text-xs text-[#0D7A4A] font-medium">Added</span>
        )}
        {!hasPhoto && (
          <>
            <span aria-hidden="true">
              <Camera
                className="w-6 h-6 shrink-0 text-[#1D242D]"
                strokeWidth={1.5}
              />
            </span>
            <span className="font-[family-name:var(--font-plus-jakarta)] text-xs leading-4 text-center text-[#969696]">
              {slot.label}
            </span>
          </>
        )}
      </div>
    </button>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: Readonly<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={className}>
      <label className={`block mb-1.5 ${labelBase}`}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

export function SellVehicleStep3() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<(File | null)[]>(new Array(PHOTO_SLOTS.length).fill(null));
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>(
    new Array(PHOTO_SLOTS.length).fill(null)
  );
  const [maxScroll, setMaxScroll] = useState(0);
  const [price, setPrice] = useState('');
  const [letAfrozonValue, setLetAfrozonValue] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const photoCount = photos.filter(Boolean).length;

  // Object URL previews and cleanup
  const previewUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    const urls: (string | null)[] = photos.map((file) =>
      file ? URL.createObjectURL(file) : null
    );
    previewUrlsRef.current = urls.filter((u): u is string => u != null);
    setPreviewUrls(urls);
    return () => previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  // Slider max scroll on mobile
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const update = () => {
      const cw = content.getBoundingClientRect().width;
      const tw = container.clientWidth;
      setMaxScroll(Math.max(0, cw - tw));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(content);
    return () => ro.disconnect();
  }, [photos.length]);

  const openFilePicker = (index: number) => {
    setActiveSlotIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file != null && activeSlotIndex != null) {
      setPhotos((prev) => {
        const next = [...prev];
        next[activeSlotIndex] = file;
        return next;
      });
    }
    setActiveSlotIndex(null);
    e.target.value = '';
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    const current = x.get();
    const slotWidth = 180;
    const gap = 16;
    const delta = direction === 'left' ? slotWidth + gap : -(slotWidth + gap);
    const next = Math.max(-maxScroll, Math.min(0, current + delta));
    animate(x, next, { type: 'spring', stiffness: 300, damping: 30 });
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Vehicle Photos */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={labelBase}>
            Vehicle Photos <span className="text-red-500">*</span>
          </span>
          <span className="font-body text-sm font-semibold leading-5 text-[#0D7A4A]">
            {photoCount} / {MIN_PHOTOS} minimum photos added
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Upload vehicle photo"
        />
        {/* Mobile: horizontal slider */}
        <div ref={containerRef} className="overflow-hidden sm:hidden -mx-1">
          <motion.div
            ref={contentRef}
            className="flex flex-row gap-4 w-max cursor-grab active:cursor-grabbing py-1"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: -maxScroll, right: 0 }}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
            whileTap={{ cursor: 'grabbing' }}
          >
            {PHOTO_SLOTS.map((slot, index) => (
              <PhotoSlot
                key={slot.key}
                slot={slot}
                hasPhoto={photos[index] != null}
                previewUrl={previewUrls[index]}
                onPick={() => openFilePicker(index)}
                className="shrink-0 w-[min(180px,40vw)] min-h-[120px]"
              />
            ))}
          </motion.div>
          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={() => scrollSlider('left')}
              className="flex justify-center items-center w-9 h-9 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollSlider('right')}
              className="flex justify-center items-center w-9 h-9 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Desktop: grid */}
        <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {PHOTO_SLOTS.map((slot, index) => (
            <PhotoSlot
              key={slot.key}
              slot={slot}
              hasPhoto={photos[index] != null}
              previewUrl={previewUrls[index]}
              onPick={() => openFilePicker(index)}
              className="min-h-[158px]"
            />
          ))}
        </div>
      </div>

      {/* Your Asking Price */}
      <div className="flex flex-col gap-6">
        <Field label="Your Asking Price" required>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              inputMode="numeric"
              className={inputBase}
              placeholder="$ e.g 22000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={letAfrozonValue}
              aria-label="Asking price"
            />
            <label className="flex flex-row items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="price-source"
                checked={!letAfrozonValue}
                onChange={() => setLetAfrozonValue(false)}
                className="w-5 h-5 rounded-full border-2 border-[#49454F] text-[#0D7A4A] focus:ring-[#0D7A4A]"
                aria-label="I have an asking price"
              />
              <span className="font-body text-base font-normal leading-6 text-[#181D27]">
                I have an asking price
              </span>
            </label>
            <label className="flex flex-row items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="price-source"
                checked={letAfrozonValue}
                onChange={() => setLetAfrozonValue(true)}
                className="w-5 h-5 rounded-full border-2 border-[#49454F] text-[#0D7A4A] focus:ring-[#0D7A4A]"
                aria-label="Let Afrozon value it for me"
              />
              <span className="font-body text-base font-normal leading-6 text-[#181D27]">
                I don&apos;t know my price – let Afrozon value it for me
              </span>
            </label>
          </div>
        </Field>

        <Field label="Additional Notes (optional)">
          <textarea
            className={textareaBase}
            placeholder="Anything else buyers should know? Recent service history, new tyres, original receipts available, etc"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={4}
            aria-label="Additional notes"
          />
        </Field>
      </div>
    </div>
  );
}
