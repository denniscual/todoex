'use client';
import { Button } from '@/components/ui/button';
import { ComponentPropsWithoutRef, ReactNode, useState } from 'react';
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
import { ValueOf } from '@/lib/types';

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
    label: 'No Date',
    icon: <CircleBackslashIcon className="text-slate-500" />,
  },
} satisfies Record<DueDateOptionValue, DueDateOption>;

const dueDateOptions = Object.values(dueDateOptionsObject);

export default function DueDateCombobox({ dueDate = new Date() }: { dueDate?: Date | null }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(() => (dueDate ? dueDate : undefined));
  const [dueDateOptionsValue, setDueDateOptionsValue] = useState<
    ValueOf<typeof dueDateOptionsObject>['value']
  >(() => {
    if (!date) {
      return dueDateOptionsObject['no date'].value;
    }
    if (isToday(date)) {
      return dueDateOptionsObject.today.value;
    }
    if (isTomorrow(date)) {
      return dueDateOptionsObject.tomorrow.value;
    }
    return dueDateOptionsObject['date picker'].value;
  });

  let comboboxLabel = '';
  switch (dueDateOptionsValue) {
    case dueDateOptionsObject.today.value: {
      comboboxLabel = dueDateOptionsObject.today.label;
      break;
    }
    case dueDateOptionsObject.tomorrow.value: {
      comboboxLabel = dueDateOptionsObject.tomorrow.label;
      break;
    }
    case dueDateOptionsObject['no date'].value: {
      comboboxLabel = 'Select due date';
      break;
    }
    default: {
      if (!date) {
        comboboxLabel = 'Select due date';
      } else {
        if (isWithinSevenDays(date)) {
          comboboxLabel = formatDate(date, DATE_FORMATS.WEEKDAY_DATE_FORMAT);
        } else {
          comboboxLabel = formatDate(date, DATE_FORMATS.LONG_DATE_FORMAT);
        }
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild id="select-due-date">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-start hover:bg-transparent"
        >
          <span className="w-4 h-4 mr-2">{dueDateOptionsObject[dueDateOptionsValue].icon}</span>

          {comboboxLabel}
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
                      isSelected={dateOption.value === dueDateOptionsValue}
                      onDatePickerSelect={(date) => {
                        setDate(date);
                        setOpen(false);
                        if (date && isTomorrow(date)) {
                          setDueDateOptionsValue(dueDateOptionsObject.tomorrow.value);
                        } else {
                          setDueDateOptionsValue(dueDateOptionsObject['date picker'].value);
                        }
                      }}
                      date={date}
                    />
                  );
                }
                return (
                  <CommandItem
                    key={dateOption.value}
                    onSelect={(ownValue) => {
                      const currentDate = new Date();
                      switch (dateOption.value) {
                        case dueDateOptionsObject['no date'].value: {
                          setDate(undefined);
                          break;
                        }
                        case dueDateOptionsObject.today.value: {
                          setDate(currentDate);
                          break;
                        }
                        case dueDateOptionsObject.tomorrow.value: {
                          setDate(addDays(currentDate, 1));
                          break;
                        }
                        default: {
                        }
                      }
                      setDueDateOptionsValue(ownValue as DueDateOption['value']);
                      setOpen(false);
                    }}
                  >
                    <span className="w-4 h-4 mr-2">{dateOption.icon}</span>
                    {dateOption.label}
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        dueDateOptionsValue === dateOption.value ? 'opacity-100' : 'opacity-0'
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
