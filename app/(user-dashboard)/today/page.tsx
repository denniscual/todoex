import { getUserTasks } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { updateTaskByIdAction } from '@/lib/actions';
import TodayUserTasks from './_today-user-tasks';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const revalidate = 0;

export default async function Today() {
  const user = await currentUser();
  const userId = user?.id ?? '';
  const tasks = await getUserTasks(userId);

  return (
    <Suspense
      fallback={
        <div className="space-y-10">
          <Skeleton className="h-8 w-[160px]" />
          <div className="grid gap-6">
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
          </div>
        </div>
      }
    >
      <TodayUserTasks
        tasks={tasks}
        updateTaskByIdAction={async (task) => {
          'use server';
          const res = await updateTaskByIdAction(task);
          revalidatePath('/today');
          return res;
        }}
      />
    </Suspense>
  );
}
