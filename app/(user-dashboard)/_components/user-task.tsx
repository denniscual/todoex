'use client';
import { TaskWithProject } from '@/db';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { TASK_STATUS_TEXTS, isTaskCompleted, toggleStatus } from '@/lib/db';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DeleteTaskByIdAction, UpdateTaskByIdAction } from '@/lib/actions';

export default function UserTask({
  task,
  updateTaskByIdAction,
  deleteTaskByIdAction,
}: {
  task: TaskWithProject;
  updateTaskByIdAction: UpdateTaskByIdAction;
  deleteTaskByIdAction: DeleteTaskByIdAction;
}) {
  const { toast } = useToast();
  const router = useRouter();

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
        <UserTaskAction task={task} deleteTaskByIdAction={deleteTaskByIdAction} />
      </div>
    </div>
  );
}

function UserTaskAction({
  task,
  deleteTaskByIdAction,
}: {
  task: TaskWithProject;
  deleteTaskByIdAction: DeleteTaskByIdAction;
}) {
  const { toast } = useToast();
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
          <Link className="cursor-pointer" href={`/tasks/${task.id}`}>
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <form
            action={async () => {
              try {
                await deleteTaskByIdAction(task.id);
                toast({
                  title: 'A task is deleted.',
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
            }}
            className="w-full"
          >
            <button className="w-full text-left text-red-500">Delete</button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
