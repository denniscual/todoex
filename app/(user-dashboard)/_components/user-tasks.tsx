'use client';
import { TaskWithProject } from '@/db';
import UserTask from '@/app/(user-dashboard)/_components/user-task';
import { UpdateTaskByIdAction } from '@/lib/actions';

export default function UserTasks({
  tasks,
  // This function is a server action so we can ignore the warning.
  updateTaskByIdAction,
}: {
  tasks: TaskWithProject[];
  updateTaskByIdAction: UpdateTaskByIdAction;
}) {
  return (
    <ul className="grid gap-6 list-none">
      {tasks.map((task) => (
        <li key={task.id} className="pb-4 border-b ">
          <UserTask task={task} updateTaskByIdAction={updateTaskByIdAction} />
        </li>
      ))}
    </ul>
  );
}
