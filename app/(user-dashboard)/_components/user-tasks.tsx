'use client';
import { Task } from '@/db';
import { UpdateTaskStatusAction } from '@/app/(user-dashboard)/today/_server-actions';
import UserTask from '@/app/(user-dashboard)/_components/user-task';

export default function UserTasks({
  tasks,
  // This function is a server action so we can ignore the warning.
  updateTaskStatusAction,
}: {
  tasks: Task[];
  updateTaskStatusAction: UpdateTaskStatusAction;
}) {
  return (
    <ul className="grid gap-6 list-none">
      {tasks.map((task) => (
        <li key={task.id} className="pb-4 border-b ">
          <UserTask task={task} updateTaskStatusAction={updateTaskStatusAction} />
        </li>
      ))}
    </ul>
  );
}
