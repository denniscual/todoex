'use client';
import { TaskWithProject } from '@/db';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { TASK_STATUS_TEXTS, isTaskCompleted } from '@/lib/db';
import { UpdateTaskStatusAction } from '@/app/(user-dashboard)/today/_server-actions';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function UserTask({
  task,
  updateTaskStatusAction,
}: {
  task: TaskWithProject;
  updateTaskStatusAction: UpdateTaskStatusAction;
}) {
  const { toast } = useToast();
  const router = useRouter();

  async function action(_task: TaskWithProject, hideSuccessToast = false) {
    try {
      const res = await updateTaskStatusAction({
        id: _task.id,
        status: _task.status,
      });
      if (!hideSuccessToast) {
        toast({
          title: `1 task is ${
            res.result.status === 'completed'
              ? TASK_STATUS_TEXTS.COMPLETED
              : TASK_STATUS_TEXTS.OPENED
          }.`,
          duration: 5000,
          action: (
            <form
              action={() => {
                action(
                  {
                    ..._task,
                    status: res.result.status,
                  },
                  true
                );
              }}
            >
              <ToastAction type="submit" altText="Undo">
                Undo
              </ToastAction>
            </form>
          ),
        });
      }
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
      <form className="flex items-center flex-1 gap-4" action={() => action(task)}>
        <Checkbox
          type="submit"
          defaultChecked={isTaskCompleted(task.status)}
          id={task.id.toString()}
        />
        <button
          type="button"
          onClick={() => router.push(`/tasks/${task.id}`)}
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
          <Button variant="link" className="p-0 text-foreground/60" asChild>
            <Link onClick={(event) => event.stopPropagation()} href={`/projects/${task.projectId}`}>
              {task.projectTitle}
            </Link>
          </Button>
        </button>
      </form>
      <div>
        <UserTaskAction task={task} />
      </div>
    </div>
  );
}

function UserTaskAction({ task }: { task: TaskWithProject }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="w-4 h-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link href={`/tasks/${task.id}`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="text-red-500">Delete</span>
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
