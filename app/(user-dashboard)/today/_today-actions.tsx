'use client';
import { DATE_FORMATS, formatDate } from '@/lib/utils';
import { ReactNode } from 'react';

export default function TodayActions({ children }: { children: ReactNode }) {
  const formattedDate = formatDate(new Date(), DATE_FORMATS.LONG_DATE_FORMAT);

  return (
    <section className="space-y-10">
      <div className="inline-flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <span className="text-sm text-foreground/60">{formattedDate}</span>
      </div>
      {children}
    </section>
  );
}
