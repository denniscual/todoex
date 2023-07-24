'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task } from '@/db';
import { UpdateTaskStatusAction } from '../today/_server-actions';
import { experimental_useOptimistic as useOptimistic, startTransition } from 'react';

export default function StatusSelect({
  id,
  status,
  updateTaskStatusAction,
}: Pick<Task, 'id' | 'status'> & {
  updateTaskStatusAction: UpdateTaskStatusAction;
}) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);

  const selectTriggerStyles: Record<string, string> = {
    pending: 'text-blue-500',
    completed: 'text-green-500',
  };

  async function action() {
    await updateTaskStatusAction({
      id,
      status,
    });
  }

  return (
    <div>
      <Select
        value={optimisticStatus}
        onValueChange={(val) => {
          setOptimisticStatus(val as Task['status']);
          startTransition(() => {
            action();
          });
        }}
      >
        <SelectTrigger id={`select-status-${id}`} className={selectTriggerStyles[optimisticStatus]}>
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
    </div>
  );
}
