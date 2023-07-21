'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import DueDateCombobox from '@/app/(user-dashboard)/_components/due-date-combobox';

export default function TaskDialog() {
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
    >
      <DialogContent className="max-w-[864px] h-[calc(100%-96px)] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-2 pb-2 border-b">
          <DialogTitle>
            <Button variant="link" className="p-0 text-foreground/60" asChild>
              <Link href="/projects/1">Daily tasks</Link>
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-start flex-1">
          <div className="grid flex-1 gap-4 p-6">
            <span className="text-xl font-semibold tracking-tight">Do coding</span>
            <p className="text-sm">Description</p>
          </div>
          <div className="w-[300px] p-6 border-l self-stretch space-y-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-foreground/60" htmlFor="select-status">
                Status
              </Label>
              <SelectStatus />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-foreground/60" htmlFor="select-project">
                Project
              </Label>
              <Select defaultValue="daily">
                <SelectTrigger id="select-project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Tasks</SelectItem>
                  <SelectItem value="agile">Agile Automation Tracker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-foreground/60" htmlFor="select-due-date">
                Due date
              </Label>
              <DueDateCombobox />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SelectStatus() {
  const [value, setValue] = useState('pending');

  const selectTriggerStyles: Record<string, string> = {
    pending: 'text-blue-500',
    completed: 'text-green-500',
  };

  return (
    <Select
      value={value}
      onValueChange={(value) => {
        setValue(value);
      }}
    >
      <SelectTrigger id="select-status" className={selectTriggerStyles[value]}>
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          className="text-blue-500 data-[highlighted]:bg-blue-500 data-[highlighted]:text-white"
          value="pending"
        >
          Pending
        </SelectItem>
        <SelectItem
          className="text-green-500 data-[highlighted]:bg-green-500 data-[highlighted]:text-white"
          value="completed"
        >
          Completed
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
