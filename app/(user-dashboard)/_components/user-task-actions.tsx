'use client';
import { TaskWithProject } from '@/db';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CopyIcon, DotsHorizontalIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { DeleteTaskByIdAction } from '@/lib/actions';
import { useParams, useRouter } from 'next/navigation';

export default function UserTaskActions({
  task,
  deleteTaskByIdAction,
  taskPathname,
  redirectBackAfterDeletion = false,
}: {
  task: TaskWithProject;
  deleteTaskByIdAction: DeleteTaskByIdAction;
  taskPathname?: string;
  redirectBackAfterDeletion?: boolean;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const isProjectRoute = Boolean(params.projectId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="w-4 h-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {Boolean(taskPathname) && (
          <DropdownMenuItem asChild>
            <Link className="cursor-pointer" href={taskPathname as any}>
              Edit
              <DropdownMenuShortcut>
                <Pencil1Icon className="w-4 h-4" />
              </DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <button
            className="flex items-center w-full cursor-pointer"
            onClick={async () => {
              const rootTaskLink = `${window.location.origin}/tasks/${task.id}`;
              try {
                await navigator.clipboard.writeText(rootTaskLink);
                toast({
                  title: 'Task link copied.',
                });
              } catch (err) {
                toast({
                  variant: 'destructive',
                  title: 'Something went wrong.',
                  description: 'Failed to copy content',
                  action: <ToastAction altText="Try again">Try again</ToastAction>,
                });
                console.error('Client Error:', err);
              }
            }}
          >
            Copy link to task
            <DropdownMenuShortcut>
              <CopyIcon className="w-4 h-4" />
            </DropdownMenuShortcut>
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <form
            action={async () => {
              try {
                await deleteTaskByIdAction(task.id);
                // If true, the user will be redirected back to the previous route.
                // This logic will be used when this UserTaskActions is rendered inside Dialog with Parallel route.
                if (redirectBackAfterDeletion) {
                  router.back();
                } else {
                  // After successful deleation, redirect to project page
                  // if the Component is rendered inside a project page.
                  // Else, redirect to today route.
                  // Use `.replace` to remove the current route from the history stack.
                  if (isProjectRoute) {
                    router.replace(`/projects/${task.projectId}`);
                  } else {
                    router.replace('/today');
                  }
                }
              } catch (err) {
                toast({
                  variant: 'destructive',
                  title: 'Something went wrong.',
                  description: 'There was a problem with your request.',
                  action: <ToastAction altText="Try again">Try again</ToastAction>,
                });
                console.error('Server Error: ', err);
              }
            }}
          >
            <button className="flex items-center w-full text-red-500">
              Delete
              <DropdownMenuShortcut>
                <TrashIcon className="w-4 h-4" />
              </DropdownMenuShortcut>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
