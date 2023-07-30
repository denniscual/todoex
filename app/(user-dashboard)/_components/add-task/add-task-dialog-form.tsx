'use client';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, UserProject } from '@/db';
import { ProjectSelect } from '@/components/project-select';
import { ReloadIcon } from '@radix-ui/react-icons';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';
import { InsertTaskAction } from '@/lib/actions';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { DATE_FORMATS, formatDate } from '@/lib/utils';

export default function AddTaskDialogForm({
  userId,
  projects,
  insertTaskAction,
  onCancel,
  onSuccess,
}: {
  userId: User['id'];
  projects: UserProject[];
  insertTaskAction: InsertTaskAction;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();

  return (
    <form
      action={async (formData) => {
        try {
          const values = Object.fromEntries(formData.entries());
          await insertTaskAction({
            userId,
            title: (values.title as string).trim(),
            projectId: parseInt(values.project as string),
            dueDate: formatDate(new Date(), DATE_FORMATS.ISO_DATE_FORMAT),
          });
          toast({
            title: '1 task is added.',
            duration: 5000,
          });
          onSuccess?.();
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
    >
      <DialogHeader>
        <DialogTitle>Add task</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="title" className="text-right">
            Title
          </Label>
          <div className="col-span-3">
            <Input
              name="title"
              id="title"
              placeholder="E.g Go to the beach"
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="select-project" className="text-right">
            Project
          </Label>
          <div className="col-span-3">
            <ProjectSelect name="project" id="select-project" projects={projects} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <FormSubmitButton />
      </DialogFooter>
    </form>
  );
}

function FormSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <ReloadIcon className="w-4 h-4 mr-2 animate-spin" />}
      Add Task
    </Button>
  );
}
