'use client';
import { TaskWithProject } from '@/db';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { TASK_STATUS_TEXTS, isTaskCompleted, toggleStatus } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DeleteTaskByIdAction, UpdateTaskByIdAction } from '@/lib/actions';
import UserTaskActions from './user-task-actions';

export default function UserTask({
  task,
  updateTaskByIdAction,
  deleteTaskByIdAction,
  hideProjectLink = false,
}: {
  task: TaskWithProject;
  updateTaskByIdAction: UpdateTaskByIdAction;
  deleteTaskByIdAction: DeleteTaskByIdAction;
  hideProjectLink?: boolean;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const taskPathname = params.projectId
    ? `/projects/${params.projectId}/tasks/${task.id}`
    : `/tasks/${task.id}`;

  async function action() {
    try {
      const res = await updateTaskByIdAction({
        ...task,
        status: toggleStatus(task.status),
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
    <div className="flex justify-between">
      <form className="flex items-center flex-1 gap-4" action={action}>
        <Checkbox type="submit" checked={isTaskCompleted(task.status)} />
        <button
          type="button"
          onClick={() => router.push(taskPathname as any)}
          className="flex flex-col items-start flex-1 cursor-pointer"
        >
          <span
            className={cn(
              'md:max-w-screen-md',
              isTaskCompleted(task.status) ? 'line-through' : 'no-underline'
            )}
          >
            {task.title}
          </span>
          {!hideProjectLink && (
            <Button variant="link" className="p-0 text-foreground/60" asChild>
              <Link
                onClick={(event) => event.stopPropagation()}
                href={`/projects/${task.projectId}`}
              >
                {task.projectTitle}
              </Link>
            </Button>
          )}
        </button>
      </form>
      <div>
        <UserTaskActions
          taskPathname={taskPathname}
          task={task}
          deleteTaskByIdAction={deleteTaskByIdAction}
        />
      </div>
    </div>
  );
}
