'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task } from '@/db';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { TASK_STATUS_TEXTS } from '@/lib/db';
import { startTransition } from 'react';
import { UpdateTaskByIdAction } from '@/lib/actions';

export default function StatusSelect({
  id,
  status,
  updateTaskByIdAction,
}: Pick<Task, 'id' | 'status'> & {
  updateTaskByIdAction: UpdateTaskByIdAction;
}) {
  const { toast } = useToast();

  const selectTriggerStyles: Record<string, string> = {
    pending: 'text-blue-500',
    completed: 'text-green-500',
  };

  async function action(_status: Task['status']) {
    try {
      const res = await updateTaskByIdAction({
        id,
        status: _status,
      });
      toast({
        title: `1 task is ${
          res.result.status === 'completed' ? TASK_STATUS_TEXTS.COMPLETED : TASK_STATUS_TEXTS.OPENED
        }.`,
        duration: 5000,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong.',
        description: 'There was a problem with your request.',
        action: <ToastAction altText="Try again">Try again</ToastAction>,
        duration: 5000,
      });
      console.error('Server Error: ', err);
    }
  }

  return (
    <Select
      value={status}
      onValueChange={(val) => {
        startTransition(() => {
          action(val as Task['status']);
        });
      }}
    >
      <SelectTrigger id={`select-status-${id}`} className={selectTriggerStyles[status]}>
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
