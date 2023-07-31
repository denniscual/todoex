import { currentUser } from '@clerk/nextjs';
import { getProjectById, getUserProjectTasks } from '@/db';
import { redirect } from 'next/navigation';
import UserTasks from '@/app/(user-dashboard)/_components/user-tasks';
import { deleteTaskByIdAction, updateTaskByIdAction } from '@/lib/actions';
import { revalidatePath } from 'next/cache';

export default async function Project({ params }: { params: { id: string } }) {
  const { id: projectId } = params;
  const [user, project] = await Promise.all([currentUser(), getProjectById(projectId)]);
  const userId = user?.id ?? '';

  if (!project) {
    // @ts-expect-error type is of type RedirectType enum. nextjs didn't export the type.
    return redirect('/today', 'replace');
  }

  if (!userId) {
    // @ts-expect-error type is of type RedirectType enum. nextjs didn't export the type.
    return redirect('/sign-in', 'replace');
  }

  const userProjectTasks = await getUserProjectTasks(userId, project.id);
  const pathname = `/projects/${project.id}`;

  return (
    <section className="space-y-10">
      <div className="inline-flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
      </div>
      {userProjectTasks.length > 0 ? (
        <UserTasks
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
          tasks={userProjectTasks}
        />
      ) : (
        <p>{`Your schedule is clear today - no tasks! Feel free to add some or enjoy your day off.`}</p>
      )}
    </section>
  );
}
