'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PlusIcon } from '@radix-ui/react-icons';
import AddProjectDialogForm from './add-project-dialog-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProjectDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <AddProjectDialogForm
          onCancel={() => setOpen(false)}
          onSuccess={(project) => {
            setOpen(false);
            router.push(`/projects/${project.id}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
