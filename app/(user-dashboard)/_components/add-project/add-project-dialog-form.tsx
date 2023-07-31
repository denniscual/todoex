'use client';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Project } from '@/db';
import { insertProjectAction } from '@/lib/actions';
import { useAuth } from '@clerk/nextjs';
import { ReloadIcon } from '@radix-ui/react-icons';
import { ToastAction } from '@radix-ui/react-toast';
import { useRouter } from 'next/navigation';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';

export default function AddProjectDialogForm({
  onSuccess,
  onCancel,
}: {
  onCancel?: () => void;
  onSuccess?: (project: Project) => void;
}) {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  if (!auth.userId) {
    router.push('/sign-in' as any);
    return null;
  }

  return (
    <form
      action={async (formData) => {
        try {
          const values = Object.fromEntries(formData.entries());
          const title = (values.title as string).trim();
          const description = (values.description as string).trim();
          const res = await insertProjectAction({
            userId: auth.userId,
            title,
            description,
          });
          toast({
            title: `Project "${title}" is created.`,
            duration: 5000,
          });
          onSuccess?.(res.result);
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
        <DialogTitle>Add project</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="title" className="text-right">
            Title
          </Label>
          <Input placeholder="E.g Daily Tasks" name="title" id="title" className="col-span-3" />
        </div>
        <div className="grid items-center grid-cols-4 gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea rows={4} name="description" id="description" className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onCancel} variant="outline">
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
      Add Project
    </Button>
  );
}
