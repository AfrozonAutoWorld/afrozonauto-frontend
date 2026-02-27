'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getMakeLogoUrl } from '@/lib/makeLogo';

export interface PopularMakeCardProps {
  /** Make name, e.g. "Toyota" */
  name: string;
  /** Number of vehicles to display, e.g. 142 */
  vehicleCount: number;
  /** Optional: image URL for the make logo, or React node (e.g. icon). If omitted, logo is resolved via make name (avto-dev CDN). */
  logo?: string | React.ReactNode;
  /** Optional: link to marketplace filtered by this make. Omit to render as non-link. */
  href?: string;
}

function MakeLogoImage({ name, overrideSrc }: { name: string; overrideSrc?: string }) {
  const [error, setError] = useState(false);
  const src = overrideSrc ?? getMakeLogoUrl(name);
  if (error || !src) {
    return (
      <span
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#666666] font-sans font-semibold text-sm text-white"
        aria-hidden
      >
        {name.charAt(0)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={40}
      height={40}
      className="w-10 h-10 object-contain"
      onError={() => setError(true)}
    />
  );
}

export function PopularMakeCard({
  name,
  vehicleCount,
  logo,
  href,
}: PopularMakeCardProps) {
  const content = (
    <>
      <div className="flex-none w-10 h-10 shrink-0 flex items-center justify-center text-[#666666]">
        {typeof logo === 'string' ? (
          <MakeLogoImage name={name} overrideSrc={logo} />
        ) : logo != null ? (
          logo
        ) : (
          <MakeLogoImage name={name} />
        )}
      </div>
      <div className="flex flex-col justify-center items-center gap-1 w-full min-w-0 flex-none self-stretch">
        <span className="w-full font-sans font-semibold text-[18px] leading-7 text-[#484848] flex items-center justify-center text-center">
          {name}
        </span>
        <span className="w-full font-body font-normal text-[14px] leading-5 text-[#B8B8B8] flex items-center justify-center text-center">
          {vehicleCount} vehicles
        </span>
      </div>
    </>
  );

  const className =
    'box-border flex flex-col justify-center items-center py-4 gap-6 w-[194px] h-[148px] bg-white border border-[#E8E8E8] rounded-2xl flex-none hover:border-[#cccccc] hover:shadow-sm transition-colors';

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
