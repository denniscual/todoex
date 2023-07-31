'use client';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Project, User, UserProject } from '@/db';
import AddTaskDialogForm from '@/app/(user-dashboard)/_components/add-task/add-task-dialog-form';
import { InsertTaskAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

// TODO:
// - add client-side validation with `insertTaskSchema Zod`.
export default function AddTaskDialog({
  insertTaskAction,
  projects,
  userId,
}: {
  insertTaskAction: InsertTaskAction;
  projects: UserProject[];
  userId: User['id'];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <AddTaskDialogForm
          userId={userId}
          insertTaskAction={insertTaskAction}
          projects={projects}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
