import { Label } from '@/components/ui/label';
import { Task, TaskWithProject, User, getTaskById, getUserProjects } from '@/db';
import StatusSelect from './status-select';
import DueDateCombobox from './due-date-combobox';
import { updateTaskByIdAction } from '@/lib/actions';
import { revalidatePath } from 'next/cache';
import ProjectSelect from './project-select';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function UserTaskDetails({ id }: { id: Task['id'] }) {
  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  preloadUserProjects(user.id);
  const userTask = await getTaskById(id);

  if (!userTask) {
    return <div>No task found.</div>;
  }

  return (
    <div className="flex items-start flex-1">
      <div className="grid flex-1 gap-4 p-6">
        <span className="text-xl font-semibold tracking-tight">{userTask.title}</span>
        <p className="text-sm">{userTask.description}</p>
      </div>
      <div className="w-[300px] p-6 border-l self-stretch space-y-4">
        <Suspense
          fallback={
            <Skeleton
              className="w-[251px] h-[150px]"
              style={{
                marginTop: 0,
              }}
            />
          }
        >
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-foreground/60" htmlFor={`select-status-${userTask.id}`}>
              Status
            </Label>
            <StatusSelect
              updateTaskByIdAction={async (updatedTask) => {
                'use server';
                const res = await updateTaskByIdAction(updatedTask);
                revalidatePath(`/tasks/${updatedTask.id}`);
                return res;
              }}
              id={`select-status-${userTask.id}`}
              task={userTask}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-foreground/60" htmlFor={`select-project-${userTask.id}`}>
              Project
            </Label>
            <UserProjectSelect
              id={`select-project-${userTask.id}`}
              userId={user.id}
              task={userTask}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-foreground/60" htmlFor="select-due-date">
              Due date
            </Label>
            <DueDateCombobox />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

async function UserProjectSelect({
  userId,
  task,
  id,
}: {
  userId: User['id'];
  task: TaskWithProject;
  id: string;
}) {
  const projects = await getUserProjects(userId);
  return (
    <ProjectSelect
      updateTaskByIdAction={async (updatedTask) => {
        'use server';
        const res = await updateTaskByIdAction(updatedTask);
        revalidatePath(`/tasks/${updatedTask.id}`);
        return res;
      }}
      task={task}
      projects={projects}
      id={id}
    />
  );
}

function preloadUserProjects(id: User['id']) {
  void getUserProjects(id);
}
