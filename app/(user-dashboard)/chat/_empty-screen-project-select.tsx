'use client';
import { ProjectSelect } from '@/components/project-select';
import { Button } from '@/components/ui/button';
import { UserProject } from '@/db';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EmptyScreenProjectSelect({ projects }: { projects: UserProject[] }) {
  const [project, setProject] = useState(projects.length > 0 ? projects[0].id : undefined);
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
