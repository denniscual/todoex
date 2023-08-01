'use client';
import { DATE_FORMATS, convertToUTCFormat, formatDate } from '@/lib/utils';
import { TaskWithProject } from '@/db';
import { formatDistanceToNow } from 'date-fns';

export default function UserTaskTimestamps({
  createdAt,
  updatedAt,
}: {
  createdAt: TaskWithProject['createdAt'];
  updatedAt: TaskWithProject['updatedAt'];
}) {
  const createdAtDate = new Date(convertToUTCFormat(createdAt));
  const updatedAtDate = new Date(convertToUTCFormat(updatedAt));

  return (
    <div className="pt-2 space-y-3">
      <p className="text-xs text-foreground/60">
        Created on {formatDate(createdAtDate, DATE_FORMATS.LONG_DATE_FORMAT)} at{' '}
        {formatDate(createdAtDate, DATE_FORMATS.DEFAULT_TIME_FORMAT)}
      </p>
      <p className="text-xs text-foreground/60">Updated {formatDistanceToNow(updatedAtDate)}</p>
    </div>
  );
}
