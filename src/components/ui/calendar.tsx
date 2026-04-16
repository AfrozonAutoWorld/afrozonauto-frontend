'use client';

import * as React from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { cn } from '@/lib/utils';

import 'react-day-picker/style.css';
import '@/styles/payment-calendar.css';

export type CalendarProps = DayPickerProps;

/**
 * Calendar for date picking (used in payment modal and elsewhere).
 * Styles ship with react-day-picker; captionLayout="dropdown" gives month/year selects.
 */
export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn('rdp-payment-modal', className)}
      {...props}
    />
  );
}
