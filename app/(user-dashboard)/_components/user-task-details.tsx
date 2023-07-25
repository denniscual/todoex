import { Label } from '@/components/ui/label';
import { Task, getTaskById } from '@/db';
import StatusSelect from './status-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DueDateCombobox from './due-date-combobox';
import { updateTaskStatusAction } from '../today/_server-actions';
import { revalidatePath } from 'next/cache';

export default async function UserTaskDetails({ id }: { id: Task['id'] }) {
  const userTask = await getTaskById(id);

  if (!userTask) {
    return <div>No task found.</div>;
  }

  return (
    <div className="flex items-start flex-1">
      <div className="grid flex-1 gap-4 p-6">
        <span className="text-xl font-semibold tracking-tight">{userTask.title}</span>
        <p className="text-sm">{userTask.description}</p>
      </div>
      <div className="w-[300px] p-6 border-l self-stretch space-y-4">
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-foreground/60" htmlFor={`select-status-${userTask.id}`}>
            Status
          </Label>
          <StatusSelect
            updateTaskStatusAction={async (task) => {
              'use server';
              revalidatePath(`/tasks/${task.id}`);
              const res = await updateTaskStatusAction(task);
              return res;
            }}
            id={userTask.id}
            status={userTask.status}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-foreground/60" htmlFor="select-project">
            Project
          </Label>
          <Select defaultValue="daily">
            <SelectTrigger id="select-project">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily Tasks</SelectItem>
              <SelectItem value="agile">Agile Automation Tracker</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-foreground/60" htmlFor="select-due-date">
            Due date
          </Label>
          <DueDateCombobox />
        </div>
      </div>
    </div>
  );
}
