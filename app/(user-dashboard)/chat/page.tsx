import ChatForm from './_chat-form';
import { getUserProjectTasks, getUserProjects, getProjectById, Project, User } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import Link from 'next/link';
import EmptyScreen from './_empty-screen';
import ExampleMessages from './_example-messages';
import Chat from './_chat';

export default function RootChat({
  searchParams,
}: {
  searchParams: {
    pid?: string;
    initialMessage?: string;
  };
}) {
  const { pid, initialMessage: initialMessageIdx } = searchParams;
  const initialMessage = !!initialMessageIdx ? exampleMessages[parseInt(initialMessageIdx)] : null;
  const hasProjectId = !!pid;

  return (
    <section className="relative flex flex-col h-full">
      <Chat initialMessage={initialMessage?.message}>
        <EmptyScreen>{hasProjectId && <ExampleMessages messages={exampleMessages} />}</EmptyScreen>
      </Chat>
    </section>
  );
}

const exampleMessages = [
  {
    heading: 'Suggest a task for today',
    message: 'Suggest a task for today',
  },
  {
    heading: 'Show all of the tasks for this week.',
    message: 'Show all of the tasks for this week.',
  },
  {
    heading: 'Add "Clean my bedroom"',
    message: 'Add "Clean my bedroom"',
  },
];

async function OldChat() {
  const cookieStore = cookies();
  const user = await currentUser();
  const userId = user?.id ?? '';

  // preload current project and tasks.
  const projectId = cookieStore.get('projectId')?.value as string | undefined;
  if (!!projectId) {
    preloadProject(projectId);
    preloadUserProjectTasks(userId, projectId);
  }

  const projects = await getUserProjects(userId);

  return (
    <section className="space-y-10">
      <Link href="/projects/1">Project 1</Link>
      <form
        action={async (formData) => {
          'use server';
          const values = Object.fromEntries(formData.entries()) as {
            projects: string;
          };
          const cookieStore = cookies();
          cookieStore.set('projectId', values.projects);
          revalidatePath('/today');
        }}
        className="flex items-center gap-4"
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
        <button className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
          Pick
        </button>
      </form>
      {!!projectId && (
        <Suspense fallback={<div>Loading project...</div>}>
          <UserProject projectId={projectId} userId={userId} />
        </Suspense>
      )}
    </section>
  );
}

async function UserProject({
  projectId,
  userId,
}: {
  projectId: Project['id'];
  userId: User['id'];
}) {
  const userProject = await getProjectById(projectId);

  if (!userProject) {
    return <div>Current project is not found.</div>;
  }

  return (
    <>
      <p className="mb-4 font-semibold">{userProject.title}</p>
      <Suspense fallback={<div>Loading user tasks...</div>}>
        <UserProjectTasks projectId={projectId} userId={userId} />
      </Suspense>
      <div>
        <p className="mb-4 font-semibold">Chat Form</p>
        <ChatForm key={projectId} projectId={projectId} userId={userId} />
      </div>
    </>
  );
}

async function UserProjectTasks({
  userId,
  projectId,
}: {
  userId: User['id'];
  projectId: Project['id'];
}) {
  const tasks = await getUserProjectTasks(userId, projectId);

  if (tasks.length === 0) {
    return <div>No existing tasks</div>;
  }

  return (
    <ul>
      {tasks.map((task, idx) => (
        <li key={task.id}>
          <span className="font-medium">{idx + 1}.</span> Title: {task.title} - Status:{' '}
          {task.status} - Due date: {task.dueDate}
        </li>
      ))}
    </ul>
  );
}

function preloadUserProjectTasks(userId: User['id'], projectId: Project['id']) {
  void getUserProjectTasks(userId, projectId);
}

function preloadProject(projectId: Project['id']) {
  void getProjectById(projectId);
}
