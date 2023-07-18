import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { ValueOf } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function areDatesEqualOrGreater(date1: Date, date2: Date) {
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  return date1 >= date2;
}

export function formatDate(date: Date, formatString: ValueOf<typeof DATE_FORMATS>) {
  return format(date, formatString);
}

export const DATE_FORMATS = {
  WEEKDAY_DATE_FORMAT: 'eee dd MMM',
  ISO_DATE_FORMAT: 'yyyy-MM-dd',
} as const;
