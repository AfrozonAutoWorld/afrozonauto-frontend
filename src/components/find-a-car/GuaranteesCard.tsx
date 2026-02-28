'use client';

import { ShieldCheck, ClipboardList, Clock } from 'lucide-react';

const ITEMS = [
  {
    icon: ShieldCheck,
    iconBg: 'bg-[#103235]',
    iconBorder: 'border-[#0D7A4A]',
    title: 'Escrow protected',
    description:
      'Your deposit is held securely and only released once you approve the vehicle.',
  },
  {
    icon: ClipboardList,
    iconBg: 'bg-[rgba(20,45,59,0.9)]',
    iconBorder: 'border-[#286E80]',
    title: '150+ point inspection',
    description:
      'Every sourced vehicle goes through our full pre-purchase inspection before we buy.',
  },
  {
    icon: Clock,
    iconBg: 'bg-[#272929]',
    iconBorder: 'border-[#A66010]',
    title: 'No obligation quote',
    description:
      "Receiving a quote does not commit you to anything. Approve only when you're ready.",
  },
];

export function GuaranteesCard() {
  return (
    <div className="w-full max-w-[438px] p-6 bg-[#0B1222] rounded-2xl flex flex-col gap-8 relative">
      <div className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#E6F6F4] w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#007F6D]" aria-hidden />
          <span className="font-body font-semibold text-xs leading-4 text-[#007F6D]">
            RESPONSE TIME
          </span>
        </div>
        <div className="flex flex-col gap-0">
          <h3 className="font-body font-semibold text-base leading-6 text-white">
            Quote within 48 hours
          </h3>
          <p className="font-body text-sm leading-5 text-[#B8B8B8]">
            Weekdays, Saturday responses by Monday
          </p>
        </div>
      </div>

      <div className="border-t border-[#969696] pt-6 flex flex-col gap-3">
        {ITEMS.map((item, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div
              className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border ${item.iconBg} ${item.iconBorder}`}
            >
              <item.icon className="w-4 h-4 text-white" strokeWidth={1.5} aria-hidden />
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <h4 className="font-body font-semibold text-sm leading-5 text-white">
                {item.title}
              </h4>
              <p className="font-body text-sm leading-5 text-[#B8B8B8]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
