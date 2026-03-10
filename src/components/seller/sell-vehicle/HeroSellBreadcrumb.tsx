import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function HeroSellBreadcrumb({ text = "BROWSE CARS" }: { text?: string }) {
  return (
    <nav
      className="flex isolate flex-row gap-6 items-center font-body"
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        className="flex-none order-0 shrink-0 text-[14px] leading-5 font-normal text-[#969696] hover:text-white transition-colors"
      >
        HOME
      </Link>
      <ChevronRight
        className="w-4 h-4 shrink-0 order-1 text-[#969696]"
        aria-hidden
      />
      <span className="flex-none order-2 shrink-0 text-[14px] leading-5 font-semibold text-[#484848]">
        {text}
      </span>
    </nav>
  );
}
