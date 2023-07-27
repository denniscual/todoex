'use client';
import { Input } from '@/components/ui/input';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { TaskWithProject } from '@/db';
import { UpdateTaskByIdAction } from '@/lib/actions';
import { useRef, ElementRef } from 'react';

export default function EditTitle({
  task,
  updateTaskByIdAction,
}: {
  task: TaskWithProject;
  updateTaskByIdAction: UpdateTaskByIdAction;
}) {
  const { toast } = useToast();
  const inputRef = useRef<ElementRef<'input'>>(null);

  return (
    <form
      className="relative"
      action={async (formData) => {
        const values = Object.fromEntries(formData.entries());
        try {
          await updateTaskByIdAction({
            ...task,
            title: values.title as string,
          });
          inputRef.current?.blur();
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
          (inputRef.current as HTMLInputElement).value = task.title;
          console.error('Server Error: ', err);
        }
      }}
    >
      <Input
        key={task.title}
        placeholder="Add the task title"
        ref={inputRef}
        name="title"
        className="py-5 text-xl font-semibold tracking-tight [&:not(:focus)]:border-none [&:not(:focus)]:p-0 [&:not(:focus)]:shadow-none peer"
        defaultValue={task.title}
      />
    </form>
  );
}
