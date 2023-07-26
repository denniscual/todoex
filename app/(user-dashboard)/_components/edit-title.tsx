'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { TaskWithProject } from '@/db';
import { UpdateTaskByIdAction } from '@/lib/actions';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useState, experimental_useOptimistic as useOptimistic, useRef, ElementRef } from 'react';

export default function EditTitle({
  task,
  updateTaskByIdAction,
}: {
  task: TaskWithProject;
  updateTaskByIdAction: UpdateTaskByIdAction;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<ElementRef<'input'>>(null);
  // This state variable is used in Cancel button and reverting if there is server error request. This capture the current title.
  const [taskTitle, setTaskTitle] = useState(title);

  return (
    <form
      className="relative"
      action={async () => {
        try {
          const res = await updateTaskByIdAction({
            ...task,
            title,
          });
          inputRef.current?.blur();
          // Capture the latest title.
          setTaskTitle(res.result.title);
          toast({
            title: 'Title updated.',
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
          // Revert it to the current task title.
          setTitle(taskTitle);
        }
      }}
    >
      <Input
        placeholder="Add the task title"
        ref={inputRef}
        name="title"
        className="py-5 text-xl font-semibold tracking-tight [&:not(:focus)]:border-none [&:not(:focus)]:p-0 [&:not(:focus)]:shadow-none peer"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') {
            return;
          }
          // Revert it to the current task title.
          setTitle(taskTitle);
          inputRef.current?.blur();
        }}
      />
    </form>
  );
}
