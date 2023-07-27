'use client';
import { Dialog } from '@/components/ui/dialog';
import { DialogProps } from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SegmentDialogRoot(props: Omit<DialogProps, 'open' | 'onOpenChange'>) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        // If the new state is not open, then navigate back.
        if (!open) {
          router.back();
        }
      }}
      {...props}
    />
  );
}
