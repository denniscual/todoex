import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import DueDateCombobox from '@/app/(user-dashboard)/_components/due-date-combobox';
import TaskDialog from './_task-dialog';
import StatusSelect from '@/app/(user-dashboard)/_components/status-select';

export default function Task() {
  return (
    <TaskDialog>
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
              <StatusSelect />
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
    </TaskDialog>
  );
}
