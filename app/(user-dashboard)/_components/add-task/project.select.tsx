'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SelectProps } from '@radix-ui/react-select';
import { UserProject } from '@/db';

export default function ProjectSelect({
  id,
  projects,
  ...props
}: { id: string; projects: UserProject[] } & SelectProps) {
  return (
    <Select {...props}>
      <SelectTrigger id={`select-project-${id}`}>
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id.toString()}>
            {project.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
