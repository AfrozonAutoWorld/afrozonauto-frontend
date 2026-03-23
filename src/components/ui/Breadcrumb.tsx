import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type BreadcrumbItem = {
  label: string;
  href?: string;
  /** Overrides default link/current styling for this segment (add Tailwind text/color classes). */
  className?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
  /** Applied to segments with `href` when `item.className` is omitted. */
  linkClassName?: string;
  /** Applied to segments without `href` when `item.className` is omitted. */
  currentClassName?: string;
  separatorClassName?: string;
};

const defaultLinkClass =
  'text-[14px] leading-5 font-normal text-[#E8E8E8] hover:text-white transition-colors';
const defaultCurrentClass =
  'text-[14px] leading-5 font-semibold text-[#E6F6F4]';
const defaultSeparatorClass = 'w-4 h-4 shrink-0 text-[#E8E8E8]';

function segmentClass(
  item: BreadcrumbItem,
  linkClass: string,
  currentClass: string,
) {
  if (item.className != null && item.className !== '') {
    return `text-[14px] leading-5 ${item.className}`;
  }
  return item.href != null ? linkClass : currentClass;
}

export function Breadcrumb({
  items,
  className = 'flex isolate flex-row font-body',
  linkClassName = defaultLinkClass,
  currentClassName = defaultCurrentClass,
  separatorClassName = defaultSeparatorClass,
}: BreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={className} aria-label="Breadcrumb">
      <ol className="flex flex-row flex-wrap items-center gap-6 m-0 p-0 list-none">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const textClass = segmentClass(item, linkClassName, currentClassName);

          return (
            <li key={`${item.label}-${index}`} className="flex flex-row gap-6 items-center">
              {index > 0 && (
                <ChevronRight className={separatorClassName} aria-hidden />
              )}
              {item.href != null ? (
                <Link href={item.href} className={textClass}>
                  {item.label}
                </Link>
              ) : (
                <span className={textClass} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
