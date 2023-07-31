'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskWithProject, UserProject } from '@/db';
import { UpdateTaskByIdAction } from '@/lib/actions';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { startTransition } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProjectSelect({
  id,
  projects,
  task,
  updateTaskByIdAction,
}: {
  id: string;
  task: TaskWithProject;
  projects: UserProject[];
  updateTaskByIdAction: UpdateTaskByIdAction;
}) {
  const { toast } = useToast();

  async function action(project: UserProject) {
    try {
      await updateTaskByIdAction({
        ...task,
        projectId: project.id,
      });
      toast({
        title: (
          <span>
            Task moved to{' '}
            <Button variant="link" asChild className="p-0 font-semibold underline">
              <Link href={`/projects/${project.id}`}>{project.title}</Link>
            </Button>
            .
          </span>
        ) as any,
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
    <Select
      value={task.projectId.toString()}
      onValueChange={(val) => {
        const project = projects.find((project) => project.id === val);
        if (!project) {
          return toast({
            variant: 'destructive',
            title: 'Something went wrong.',
            description: 'The selected project is not valid.',
            duration: 5000,
          });
        }
        startTransition(() => {
          action(project);
        });
      }}
    >
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
