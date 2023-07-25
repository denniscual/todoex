'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskWithProject } from '@/db';
import { UpdateTaskByIdAction } from '@/lib/actions';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useRef } from 'react';

/**
 * TODO:
 * - fix the issue about the form action buttons. When clicking one of the buttons, it doesn't trigger an action.
 *   To solve the problem, we are going to use absolute layout for the action buttons then don't use "peer" and "focus". Use
 *   JS to show the action buttons not CSS.
 * - add state variable for the input element.
 */
export default function EditTitle({
  task,
  updateTaskByIdAction,
}: {
  task: TaskWithProject;
  updateTaskByIdAction: UpdateTaskByIdAction;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <form
      className="space-y-3"
      action={() => {
        console.log('Send');
      }}
    >
      <Input
        ref={inputRef}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') {
            return;
          }
          inputRef.current?.blur();
        }}
        className="py-5 text-xl font-semibold tracking-tight [&:not(:focus)]:border-none [&:not(:focus)]:p-0 [&:not(:focus)]:shadow-none peer"
        value={task.title}
      />
      <div className="hidden space-x-1 peer-focus:flex peer-focus:justify-end">
        <Button variant="outline" size="icon">
          <CheckIcon className="w-4 h-4" />
        </Button>
        <Button type="button" variant="outline" size="icon">
          <Cross2Icon className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
