import { getUserTasks } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { updateTaskByIdAction } from '@/lib/actions';
import TodayUserTasks from './_today-user-tasks';

export const revalidate = 0;

export default async function Today() {
  const user = await currentUser();
  const userId = user?.id ?? '';
  const tasks = await getUserTasks(userId);

  return (
    <TodayUserTasks
      tasks={tasks}
      updateTaskByIdAction={async (task) => {
        'use server';
        const res = await updateTaskByIdAction(task);
        revalidatePath('/today');
        return res;
      }}
    />
  );
}
