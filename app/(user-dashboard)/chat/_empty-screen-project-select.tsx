'use client';
import { ProjectSelect } from '@/components/project-select';
import { Button } from '@/components/ui/button';
import { UserProject } from '@/db';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function EmptyScreenProjectSelect({ projects }: { projects: UserProject[] }) {
  const searchParams = useSearchParams();
  const [project, setProject] = useState(() => {
    const defaultProject = projects[0];
    const pid = searchParams.get('pid');
    if (!!pid) {
      const foundProject = projects.find((project) => project.id === pid);
      if (foundProject) {
        return foundProject.id;
      }
    }
    return defaultProject.id;
  });
  const router = useRouter();

  return (
    <div className="space-y-2">
      <label htmlFor="select-project" className="text-sm">
        Please select a project to get started:
      </label>
      <div className="w-[400px] flex gap-4">
        <div className="flex-1">
          <ProjectSelect
            id="select-project"
            projects={projects}
            value={project}
            onValueChange={setProject}
          />
        </div>
        <Button
          disabled={!project}
          onClick={() => {
            if (!project) {
              return;
            }
            const searchParams = new URLSearchParams({
              pid: project,
            });
            router.replace(`/chat?${searchParams}`);
          }}
        >
          Select
        </Button>
      </div>
    </div>
  );
}
