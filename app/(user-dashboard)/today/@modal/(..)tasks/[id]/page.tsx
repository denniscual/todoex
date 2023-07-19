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
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
              <Label className="text-xs text-foreground/60" htmlFor="select-project">
                Project
              </Label>
              <ProjectCombobox />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-foreground/60" htmlFor="select-due-date">
                Due date
              </Label>
              <Select defaultValue="daily">
                <SelectTrigger id="select-due-date">
                  <SelectValue placeholder="Select due date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Tasks</SelectItem>
                  <SelectItem value="agile">Agile Automation Tracker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const frameworks = [
  {
    value: 'daily tasks',
    label: 'Daily Tasks',
  },
  {
    value: 'agile software automation',
    label: 'Agile Software Automation',
  },
];

export function ProjectCombobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild id="select-project">
        <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between">
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : 'Select project...'}
          <CaretSortIcon className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search project..." className="h-9" />
          <CommandEmpty>No project found.</CommandEmpty>
          <CommandGroup>
            {frameworks.map((framework) => (
              <CommandItem
                key={framework.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? '' : currentValue);
                  setOpen(false);
                }}
              >
                {framework.label}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    value === framework.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
