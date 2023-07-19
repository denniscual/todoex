'use client';
import { Task } from '@/db';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { TASK_STATUS_TEXTS, isTaskCompleted } from '@/lib/db';
import { UpdateTaskStatusAction } from '@/app/(user-dashboard)/today/_server-actions';

export default function Tasks({
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

function UserTask({
  task,
  updateTaskStatusAction,
}: {
  task: Task;
  updateTaskStatusAction: UpdateTaskStatusAction;
}) {
  const { toast } = useToast();

  async function action(_task: Task, hideSuccessToast = false) {
    try {
      const res = await updateTaskStatusAction(_task);
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
    <form className="flex items-center gap-3" action={() => action(task)}>
      <Checkbox
        type="submit"
        key={task.status}
        defaultChecked={isTaskCompleted(task)}
        id={task.id.toString()}
      />
      <Label htmlFor={task.id.toString()}>{task.title}</Label>
    </form>
  );
}
