import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { endOfYear, format, isAfter, isBefore } from 'date-fns';
import { ValueOf } from './types';
import { isWithinInterval, addDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function areDatesEqualOrGreater(date1: Date, date2: Date) {
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  return date1 >= date2;
}

export const DATE_FORMATS = {
  WEEKDAY_DATE_FORMAT: 'eeee',
  LONG_DATE_FORMAT: 'eee, MMM dd',
  LONG_DATE_FORMAT_WITH_YEAR: 'eee, MMM dd, yyyy',
  ISO_DATE_FORMAT: 'yyyy-MM-dd',
} as const;

export function formatDate(date: Date, formatString: ValueOf<typeof DATE_FORMATS>) {
  if (formatString === DATE_FORMATS.LONG_DATE_FORMAT && isNextYear(date)) {
    return format(date, DATE_FORMATS.LONG_DATE_FORMAT_WITH_YEAR);
  }
  return format(date, formatString);
}

export function isNextYear(date: Date) {
  const currentDate = new Date();
  const thisYearEnd = endOfYear(currentDate); // End of the current year
  return isAfter(date, thisYearEnd);
}

export function isWithinSevenDays(date: Date) {
  const currentDate = new Date(); // Current date and time
  const sevenDaysLater = addDays(currentDate, 7); // Add 7 days to the current date
  return isWithinInterval(date, { start: currentDate, end: sevenDaysLater });
}
