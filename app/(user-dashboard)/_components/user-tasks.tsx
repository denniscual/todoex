import { TaskWithProject } from '@/db';
import UserTask from '@/app/(user-dashboard)/_components/user-task';
import { UpdateTaskByIdAction, DeleteTaskByIdAction } from '@/lib/actions';

export default function UserTasks({
  tasks,
  updateTaskByIdAction,
  deleteTaskByIdAction,
  hideProjectLink = false,
}: {
  tasks: TaskWithProject[];
  deleteTaskByIdAction: DeleteTaskByIdAction;
  updateTaskByIdAction: UpdateTaskByIdAction;
  hideProjectLink?: boolean;
}) {
  return (
    <ul className="grid gap-6 list-none">
      {tasks.map((task) => (
        <li key={task.id} className="pb-4 border-b ">
          <UserTask
            task={task}
            updateTaskByIdAction={updateTaskByIdAction}
            deleteTaskByIdAction={deleteTaskByIdAction}
            hideProjectLink={hideProjectLink}
          />
        </li>
      ))}
    </ul>
  );
}
