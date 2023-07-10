import ChatForm from './_chat-form';
import { getUserTasksByProjectId, getUserProjects, getProject, Project, User } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

export default async function Dashboard() {
  const cookieStore = cookies();
  const user = await currentUser();
  const userId = user?.id ?? '';
  const projectId = cookieStore.get('projectId')?.value as string | undefined;
  const projects = await getUserProjects(userId);

  return (
    <div className="space-y-8">
      <form
        action={async (formData) => {
          'use server';
          const values = Object.fromEntries(formData.entries()) as {
            projects: string;
          };
          const cookieStore = cookies();
          cookieStore.set('projectId', values.projects);
          revalidatePath('/dashboard');
        }}
      >
        <label htmlFor="project-select">Choose a project:</label>
        <select defaultValue={projectId} name="projects" id="project-select">
          <option value="">--Please choose an option--</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
        <button>Pick</button>
      </form>
      {!!projectId && (
        <Suspense fallback={<div>Loading project...</div>}>
          <CurrentProject projectId={parseInt(projectId)} userId={userId} />
        </Suspense>
      )}
    </div>
  );
}

async function CurrentProject({
  projectId,
  userId,
}: {
  projectId: Project['id'];
  userId: User['id'];
}) {
  const tasks = await getUserTasksByProjectId(userId, projectId);
  const currentProject = await getProject(projectId);

  // console.log({
  //   tasks,
  // });

  // if (tasks[0].createdAt) {
  //   const date = new Date(tasks[0].createdAt);
  //   console.log({ date });
  // }

  if (!currentProject) {
    return <div>Current project is not found.</div>;
  }

  return (
    <>
      <p className="mb-4 font-semibold">{currentProject.title}</p>
      {tasks.length === 0 ? (
        <div>No existing tasks</div>
      ) : (
        <ul>
          {tasks.map((task, idx) => (
            <li key={task.id}>
              <span className="font-medium">{idx + 1}.</span> Title: {task.title} - Status:{' '}
              {task.status} - Due date: {task.dueDate}
            </li>
          ))}
        </ul>
      )}
      <div>
        <p className="mb-4 font-semibold">Chat Form</p>
        <ChatForm key={projectId} projectId={projectId} userId={userId} />
      </div>
    </>
  );
}
