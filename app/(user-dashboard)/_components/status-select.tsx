'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task } from '@/db';
import { useState } from 'react';

export default function StatusSelect({ id, status }: Pick<Task, 'id' | 'status'>) {
  const [value, setValue] = useState(status);
  console.log({ id });

  const selectTriggerStyles: Record<string, string> = {
    pending: 'text-blue-500',
    completed: 'text-green-500',
  };

  return (
    <Select
      value={value}
      onValueChange={(value) => {
        setValue(value);
      }}
    >
      <SelectTrigger id="select-status" className={selectTriggerStyles[value]}>
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          className="text-blue-500 data-[highlighted]:bg-blue-500 data-[highlighted]:text-white"
          value="pending"
        >
          Pending
        </SelectItem>
        <SelectItem
          className="text-green-500 data-[highlighted]:bg-green-500 data-[highlighted]:text-white"
          value="completed"
        >
          Completed
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
