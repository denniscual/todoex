import { currentUser } from '@clerk/nextjs';
import { User, getProjectById, getUserProjectTasks, getUserProjects } from '@/db';
import { redirect } from 'next/navigation';
import UserTasks from '@/app/(user-dashboard)/_components/user-tasks';
import { deleteTaskByIdAction, updateTaskByIdAction, insertTaskAction } from '@/lib/actions';
import { revalidatePath } from 'next/cache';
import RootAddTaskDialog from '@/app/(user-dashboard)/_components/add-task/add-task-dialog';
import { P } from 'drizzle-orm/select.types.d-b947a018';

export default async function Project({
  params: { projectId },
}: {
  params: { projectId: string };
}) {
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

  preloadUserProjects(userId);
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
      <AddTaskDialog userId={userId} pathname={pathname} />
    </section>
  );
}

async function AddTaskDialog({ userId, pathname }: { userId: User['id']; pathname: string }) {
  const userProjects = await getUserProjects(userId);
  return (
    <RootAddTaskDialog
      userId={userId}
      projects={userProjects}
      insertTaskAction={async (newTask) => {
        'use server';
        const res = await insertTaskAction(newTask);
        revalidatePath(pathname);
        return res;
      }}
    />
  );
}

function preloadUserProjects(userId: User['id']) {
  void getUserProjects(userId);
}
