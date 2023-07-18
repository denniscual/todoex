import { updateTaskStatusAction } from '@/app/(user-dashboard)/today/_server-actions';
import { isTaskCompleted, Task } from '@/db';
import { ErrorBoundary } from '@/components/error-boundary';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function Tasks({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="grid gap-6 list-none">
      {tasks.map((task) => (
        <li key={task.id} className="pb-4 border-b ">
          <ErrorBoundary>
            <form
              className="flex items-center gap-3"
              action={async () => {
                'use server';
                return await updateTaskStatusAction(task, '/today');
              }}
            >
              <Checkbox
                type="submit"
                defaultChecked={isTaskCompleted(task)}
                id={task.id.toString()}
              />
              <Label htmlFor={task.id.toString()}>{task.title}</Label>
            </form>
          </ErrorBoundary>
        </li>
      ))}
    </ul>
  );
}
