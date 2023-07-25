import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task } from '@/db';

export default function ProjectSelect({ id }: Pick<Task, 'id'>) {
  return (
    <Select defaultValue="daily">
      <SelectTrigger id={`select-project-${id}`}>
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Daily Tasks</SelectItem>
        <SelectItem value="agile">Agile Automation Tracker</SelectItem>
      </SelectContent>
    </Select>
  );
}
