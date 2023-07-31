import { getUserTasks, getUserProjects } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { deleteTaskByIdAction, updateTaskByIdAction, insertTaskAction } from '@/lib/actions';
import TodayUserTasks from './_today-user-tasks';
import AddTaskDialog from '@/app/(user-dashboard)/_components/add-task/add-task-dialog';
import { PopstateListener } from '@/components/popstate-listener';

export const revalidate = 0;

export default async function Today() {
  const user = await currentUser();
  const userId = user?.id ?? '';
  const [tasks, userProjects] = await Promise.all([getUserTasks(userId), getUserProjects(userId)]);
  const pathname = '/today';

  return (
    <TodayUserTasks
      tasks={tasks}
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
