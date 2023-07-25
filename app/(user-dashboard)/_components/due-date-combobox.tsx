'use client';
import { Button } from '@/components/ui/button';
import { ComponentPropsWithoutRef, ReactNode, startTransition, useState } from 'react';
import {
  ReaderIcon,
  CalendarIcon,
  CircleBackslashIcon,
  SunIcon,
  CheckIcon,
} from '@radix-ui/react-icons';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addDays, isToday, isTomorrow } from 'date-fns';
import { DATE_FORMATS, isWithinSevenDays, formatDate, cn } from '@/lib/utils';
import { TaskWithProject } from '@/db';
import { UpdateTaskByIdAction } from '@/lib/actions';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';

export type DueDateOptionValue = 'today' | 'tomorrow' | 'date picker' | 'no date';

export type DueDateOption = {
  value: DueDateOptionValue;
  label: string;
  icon: ReactNode;
};

const dueDateOptionsObject: Record<DueDateOptionValue, DueDateOption> = {
  today: {
    value: 'today',
    label: 'Today',
    icon: <ReaderIcon className="text-green-900 dark:text-green-500" />,
  },
  tomorrow: {
    value: 'tomorrow',
    label: 'Tomorrow',
    icon: <SunIcon className="text-orange-500" />,
  },
  'date picker': {
    value: 'date picker',
    label: 'Date Picker',
    icon: <CalendarIcon className="text-purple-500" />,
  },
  'no date': {
    value: 'no date',
    label: 'Select due date',
    icon: <CircleBackslashIcon className="text-slate-500" />,
  },
} satisfies Record<DueDateOptionValue, DueDateOption>;

const dueDateOptions = Object.values(dueDateOptionsObject);

export default function DueDateCombobox({
  task,
  updateTaskByIdAction,
  id,
}: {
  task: TaskWithProject;
  updateTaskByIdAction: UpdateTaskByIdAction;
  id: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { dueDate } = task;
  const date = dueDate ? new Date(dueDate) : undefined;

  const currentDueDateOption = getCurrentDueDateOption(date);

  async function action(_date?: Date | null) {
    try {
      await updateTaskByIdAction({
        ...task,
        dueDate: _date ? formatDate(_date, DATE_FORMATS.ISO_DATE_FORMAT) : null,
      });
      const updatedDueDateOption = getCurrentDueDateOption(_date);
      toast({
        title:
          updatedDueDateOption.value === dueDateOptionsObject['no date'].value
            ? 'Due date updated.'
            : `Due date updated to ${updatedDueDateOption.label}.`,
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
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild id={id}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-start hover:bg-transparent"
        >
          <span className="w-4 h-4 mr-2">{currentDueDateOption.icon}</span>
          {currentDueDateOption.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search options..." className="h-9" />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {dueDateOptions.map((dateOption) => {
                if (dateOption.value === dueDateOptionsObject['date picker'].value) {
                  return (
                    <DatePickerCommandItem
                      {...dateOption}
                      key={dateOption.value}
                      isSelected={dateOption.value === currentDueDateOption.value}
                      onDatePickerSelect={(_date) => {
                        setOpen(false);
                        startTransition(() => {
                          action(_date);
                        });
                      }}
                      date={date}
                    />
                  );
                }
                return (
                  <CommandItem
                    key={dateOption.value}
                    onSelect={() => {
                      setOpen(false);
                      startTransition(() => {
                        const currentDate = new Date();
                        switch (dateOption.value) {
                          case dueDateOptionsObject.today.value: {
                            action(currentDate);
                            break;
                          }
                          case dueDateOptionsObject.tomorrow.value: {
                            action(addDays(currentDate, 1));
                            break;
                          }
                          default: {
                            action(null);
                          }
                        }
                      });
                    }}
                  >
                    <span className="w-4 h-4 mr-2">{dateOption.icon}</span>
                    {dateOption.label}
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        currentDueDateOption.value === dateOption.value
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                );
              })}
              <CommandSeparator />
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function getCurrentDueDateOption(date?: Date | null) {
  if (!date) {
    return dueDateOptionsObject['no date'];
  }
  if (isToday(date)) {
    return dueDateOptionsObject.today;
  }
  if (isTomorrow(date)) {
    return dueDateOptionsObject.tomorrow;
  }
  return {
    value: dueDateOptionsObject['date picker'].value,
    label: isWithinSevenDays(date)
      ? formatDate(date, DATE_FORMATS.WEEKDAY_DATE_FORMAT)
      : formatDate(date, DATE_FORMATS.LONG_DATE_FORMAT),
    icon: dueDateOptionsObject['date picker'].icon,
  };
}

type DatePickerCommandItemProps = ComponentPropsWithoutRef<typeof CommandItem> & {
  icon: ReactNode;
  label: string;
  value: string;
  onDatePickerSelect?: (date: Date | undefined) => void;
  date: Date | undefined;
  isSelected?: boolean;
};

function DatePickerCommandItem({
  icon,
  label,
  onDatePickerSelect,
  date,
  isSelected = false,
}: DatePickerCommandItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-full">
          <CommandItem>
            <span className="w-4 h-4 mr-2">{icon}</span>
            <span>{label}</span>
            <CheckIcon
              className={cn('ml-auto h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
            />
          </CommandItem>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            setOpen(false);
            onDatePickerSelect?.(date);
          }}
          initialFocus
          disabled={(date) => date < new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
