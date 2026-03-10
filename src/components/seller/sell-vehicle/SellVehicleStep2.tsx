'use client';

import { useState } from 'react';
import { Sparkles, ThumbsUp, Wrench, ThumbsDown } from 'lucide-react';

const labelBase = 'font-body text-sm font-medium leading-5 text-[#414651]';
const pillInactive =
  'px-3 py-1.5 rounded-full font-body text-sm font-medium leading-5 text-[#666666] bg-white border border-[#B8B8B8] transition-colors hover:border-[#0D7A4A] hover:text-[#0D7A4A]';
const pillActive =
  'bg-[#E6F6F4] rounded-full px-3 py-1.5 border border-[#0D7A4A] text-[#0D7A4A] font-body text-sm font-medium leading-5';

const CONDITION_CARDS = [
  {
    key: 'excellent',
    label: 'Excellent',
    description: 'Like new. No visible flaws.',
    Icon: Sparkles,
    iconColor: 'text-[#F9C23C]',
  },
  {
    key: 'good',
    label: 'Good',
    description: 'Minor wear. Fully functional.',
    Icon: ThumbsUp,
    iconColor: 'text-[#FDD641]',
  },
  {
    key: 'fair',
    label: 'Fair',
    description: 'Noticeable wear. Needs minor work.',
    Icon: Wrench,
    iconColor: 'text-[#546881]',
  },
  {
    key: 'bad',
    label: 'Bad',
    description: 'Significant damage or issues.',
    Icon: ThumbsDown,
    iconColor: 'text-[#EF4444]',
  },
] as const;

const TITLE_OPTIONS = [
  'Clean title',
  'Salvage title',
  'Rebuilt title',
  'Has a lien',
  'Not sure',
] as const;

const ACCIDENT_OPTIONS = [
  'No accidents',
  'Minor accident',
  'Major accident',
  'Unknown',
] as const;

const KNOWN_ISSUES = [
  { id: 'engine', label: 'Engine issues', detail: 'Misfires, leaks, warning lights' },
  { id: 'transmission', label: 'Transmission issues', detail: 'Slipping, delays, rough shifts' },
  { id: 'electrical', label: 'Electrical/electronics', detail: 'Dashboard lights, AC, windows' },
  { id: 'body', label: 'Body damage/rust', detail: 'Dents, scratches, corrosion' },
  { id: 'none', label: 'No known issues', detail: 'Everything works as expected' },
] as const;

export function SellVehicleStep2() {
  const [condition, setCondition] = useState<string | null>(null);
  const [titleStatus, setTitleStatus] = useState<string | null>(null);
  const [accident, setAccident] = useState<string | null>(null);
  const [knownIssues, setKnownIssues] = useState<Set<string>>(new Set());

  const toggleIssue = (id: string) => {
    setKnownIssues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {/* Overall condition – 4 cards */}
      <div className="flex flex-col gap-2">
        <label className={labelBase}>
          Overall condition <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CONDITION_CARDS.map(({ key, label, description, Icon, iconColor }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCondition(key)}
              className={`flex flex-col justify-center items-center gap-4 p-6 rounded-2xl border text-center transition-colors ${
                condition === key
                  ? 'bg-[#E6F6F4] border-[#0D7A4A]'
                  : 'bg-white border-[#969696] hover:border-[#0D7A4A]/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} strokeWidth={2} aria-hidden />
              <span className="font-body text-sm font-semibold leading-5 text-[#1A1A1A]">
                {label}
              </span>
              <span className="font-body text-xs font-normal leading-4 text-[#969696]">
                {description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Title status */}
      <div className="flex flex-col gap-2">
        <label className={labelBase}>
          Title status <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-row flex-wrap gap-3">
          {TITLE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setTitleStatus(opt)}
              className={titleStatus === opt ? pillActive : pillInactive}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Accident history */}
      <div className="flex flex-col gap-2">
        <label className={labelBase}>
          Accident history <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-row flex-wrap gap-3">
          {ACCIDENT_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setAccident(opt)}
              className={accident === opt ? pillActive : pillInactive}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Known issues – checkboxes */}
      <div className="flex flex-col gap-2">
        <label className={labelBase}>Known issues (select all that apply)</label>
        <div className="flex flex-col gap-2">
          {KNOWN_ISSUES.map(({ id, label: issueLabel, detail }) => (
            <label
              key={id}
              className="flex flex-row items-center gap-2.5 p-2.5 rounded-lg border border-[#E8E8E8] bg-white cursor-pointer hover:border-[#969696] transition-colors"
            >
              <input
                type="checkbox"
                checked={knownIssues.has(id)}
                onChange={() => toggleIssue(id)}
                className="w-[18px] h-[18px] rounded border border-[#969696] text-[#0D7A4A] focus:ring-[#0D7A4A]"
              />
              <span className="font-body text-xs leading-4 text-[#1A1A1A]">
                <span className="font-medium">{issueLabel}</span>
                <span className="text-[#969696]"> {detail}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Modifications (optional) */}
      <div className="flex flex-col gap-2">
        <label className={labelBase}>Modifications (optional)</label>
        <textarea
          className="w-full min-h-[92px] px-3.5 py-2.5 font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 focus:border-[#0D7A4A] resize-y"
          placeholder="List any aftermarket parts, lift kits, tinting, audio upgrades, etc. Leave blank if stock."
          rows={3}
        />
      </div>
    </div>
  );
}
