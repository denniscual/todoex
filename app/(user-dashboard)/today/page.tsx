import { getUserTasks, getUserProjects, User } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { deleteTaskByIdAction, updateTaskByIdAction, insertTaskAction } from '@/lib/actions';
import RootTodayUserTasks from './_today-user-tasks';
import AddTaskDialog from '@/app/(user-dashboard)/_components/add-task/add-task-dialog';
import { PopstateListener } from '@/components/popstate-listener';
import { ComponentProps } from 'react';
import AddProjectDialog from '@/app/(user-dashboard)/_components/add-project/add-project-dialog';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';

export const revalidate = 0;

export default async function Today() {
  const user = await currentUser();
  const userId = user?.id ?? '';

  // preload user tasks
  preloadUserTasks(userId);

  const userProjects = await getUserProjects(userId);
  const pathname = '/today';

  if (userProjects.length === 0) {
    return (
      <section className="flex flex-col items-center max-w-lg gap-10 pt-8 m-auto">
        <p className="text-lg text-center">
          {`It looks like you haven't started a project yet. Let's get going! Start your first project
          and you'll be able to begin adding tasks.`}
        </p>
        <AddProjectDialog
          addButton={
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <TodayUserTasks
      userId={userId}
      updateTaskByIdAction={async (task) => {
        'use server';
        const res = await updateTaskByIdAction(task);
        revalidatePath(pathname);
        return res;
      }}
      deleteTaskByIdAction={async (id) => {
        'use server';
        const res = await deleteTaskByIdAction(id);
        revalidatePath(pathname);
        return res;
      }}
    >
      <PopstateListener
        callback={async () => {
          'use server';
          revalidatePath(pathname);
        }}
      />
      <AddTaskDialog
        userId={userId}
        projects={userProjects}
        insertTaskAction={async (newTask) => {
          'use server';
          const res = await insertTaskAction(newTask);
          revalidatePath(pathname);
          return res;
        }}
      />
    </TodayUserTasks>
  );
}

async function TodayUserTasks({
  userId,
  ...props
}: Omit<ComponentProps<typeof RootTodayUserTasks>, 'tasks'> & { userId: User['id'] }) {
  const tasks = await getUserTasks(userId);
  return <RootTodayUserTasks tasks={tasks} {...props}></RootTodayUserTasks>;
}

function preloadUserTasks(userId: User['id']) {
  void getUserTasks(userId);
}
