'use client';

import {
  Search,
  FileText,
  CheckCircle,
  Truck,
  MapPin,
} from 'lucide-react';

interface StepCardProps {
  stepNumber: string;
  title: string;
  description: string;
  iconName: 'search' | 'fileText' | 'checkCircle' | 'truck' | 'mapPin';
}

const iconMap: Record<StepCardProps['iconName'], typeof Search> = {
  search: Search,
  fileText: FileText,
  checkCircle: CheckCircle,
  truck: Truck,
  mapPin: MapPin,
};

export function StepCard({
  stepNumber,
  title,
  description,
  iconName,
}: StepCardProps) {
  const IconComponent = iconMap[iconName] ?? Search;

  return (
    <div className="flex relative flex-col gap-6 items-center">
      {/* Icon Circle */}
      <div className="flex flex-shrink-0 justify-center items-center w-16 h-16 rounded-full border-4 border-teal-500 bg-slate-900">
        <div className="flex justify-center items-center text-teal-500">
          <IconComponent className="w-6 h-6" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 items-center text-center">
        {/* Step Number */}
        <p className="text-xs font-bold tracking-wide text-teal-500">
          {stepNumber}
        </p>

        {/* Title */}
        <h3 className="max-w-xs text-lg font-semibold text-white md:text-xl">
          {title}
        </h3>

        {/* Description */}
        <p className="max-w-xs text-sm leading-relaxed text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}
