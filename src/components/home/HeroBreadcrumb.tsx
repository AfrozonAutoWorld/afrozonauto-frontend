import { Breadcrumb } from '@/components/ui/Breadcrumb';

export function HeroBreadcrumb({ text = 'BROWSE CARS' }: { text?: string }) {
  return (
    <Breadcrumb
      items={[
        { label: 'HOME', href: '/' },
        { label: text },
      ]}
    />
  );
}
