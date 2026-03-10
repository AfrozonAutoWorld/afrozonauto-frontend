'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQ_ITEMS: Array<{ id: string; question: string; answer: string }> = [
  {
    id: 'valuation',
    question: 'Is valuation really free?',
    answer:
      'Yes, completely. Submitting your vehicle details and receiving an offer from Afrozon costs nothing. There are no listing fees, no appraisal fees, and no hidden charges. We only earn when a deal is completed.',
  },
  {
    id: 'service',
    question: 'How do I know which service is right for me?',
    answer:
      'If you’re selling from the US, use our seller flow to list your vehicle and get an offer. If you’re buying from Nigeria, use the buyer flow to browse and import. Our team can also guide you based on your situation.',
  },
  {
    id: 'timeline',
    question: 'How long does the process take?',
    answer:
      'Most sellers get an offer within 24–48 hours. Once you accept, escrow and handover can be completed in a few days. Total time from listing to payment is often under two weeks.',
  },
  {
    id: 'payment',
    question: 'How and when do I get paid?',
    answer:
      'Payment is released from escrow once the buyer confirms receipt of the vehicle. You can choose wire transfer, Zelle, or check. Funds are typically available within 1–2 business days after release.',
  },
  {
    id: 'escrow',
    question: 'What is escrow and why do you use it?',
    answer:
      'Escrow holds the buyer’s payment until the vehicle is delivered and confirmed. It protects both sides: you know the money is secured before handover, and the buyer knows they only pay when they receive the car.',
  },
  {
    id: 'support',
    question: "Can't find what you need?",
    answer:
      'Our team is a message away. Use the contact form or email us for help with listing, offers, escrow, or anything else.',
  },
];

export function GotQuestionsSection() {
  return (
    <section
      className="w-full bg-[#F9FAFB] py-20"
      aria-labelledby="got-questions-heading"
    >
      <div className="flex flex-col gap-14 px-4 mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2
              id="got-questions-heading"
              className="font-sans text-[32px] font-bold leading-10 text-[#1D242D]"
            >
              Got questions? We&apos;ve got answers.
            </h2>
            <p className="font-body text-base font-normal leading-6 text-[#64748B]">
              Can&apos;t find what you need? Our team is a message away.
            </p>
          </div>
        </div>

        {/* Accordion */}
        <Accordion
          type="single"
          collapsible
          className="flex flex-col gap-6 w-full"
        >
          {FAQ_ITEMS.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="overflow-hidden w-full bg-white rounded-2xl"
            >
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger
                  className={cn(
                    'group flex flex-1 flex-row items-center justify-between gap-4 py-6 px-6',
                    'font-sans text-lg font-semibold leading-7 text-[#1F2937]',
                    'rounded-2xl data-[state=closed]:rounded-2xl',
                    'data-[state=open]:rounded-b-none data-[state=open]:border data-[state=open]:border-b-0 data-[state=open]:border-[#0C623C]',
                    'transition-[border-radius,border-color] duration-200',
                    'hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C623C] focus-visible:ring-offset-2',
                  )}
                >
                  <span className="text-left">{item.question}</span>
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#969696]',
                      'transition-transform duration-300 ease-out',
                      'group-data-[state=open]:rotate-180',
                    )}
                    aria-hidden
                  >
                    <ChevronDown className="w-5 h-5" strokeWidth={2} />
                  </span>
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionContent
                className={cn(
                  'overflow-hidden border-x border-b border-t border-[#0C623C] border-t-[#B8B8B8]',
                  'bg-white px-6 py-8 rounded-b-2xl',
                  'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
                  'data-[state=open]:duration-300 data-[state=closed]:duration-300',
                )}
              >
                <p className="font-body text-lg font-normal leading-7 text-[#475569]">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
