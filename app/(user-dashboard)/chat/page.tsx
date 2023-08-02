import ChatForm from './_chat-form';
import { getUserProjectTasks, getUserProjects, getProjectById, Project, User } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import PromptForm from '@/app/(user-dashboard)/_components/chat/prompt-form';
import { ExternalLink } from '@/components/external-link';
import { Button } from '@/components/ui/button';
import { UpdateIcon } from '@radix-ui/react-icons';
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom';

export default function Chat() {
  return (
    <section className="relative flex flex-col h-full">
      <div className="flex-1 px-2 space-y-6">
        {Array(12)
          .fill(
            `flsajd lkf jasdlkfjlaskd jflkasdj fklasjdkl fjasldk flkasdj flkajsdfl jasdlkf jasdlkf
          lksadfj sadfsdfas fkasj dfasdfasdf asdfaads;fa`
          )
          .map((val, idx) => (
            <p key={idx}>{val}</p>
          ))}
      </div>
      <div className="sticky bottom-0 z-40 px-4 py-2 space-y-4 border-t shadow-lg supports-backdrop-blur:bg-background/60 bg-background/95 backdrop-blur sm:rounded-t-xl sm:border md:py-4">
        <ButtonScrollToBottom />
        <Card className="flex flex-col flex-grow">
          <CardContent className="p-0">
            <PromptForm />
          </CardContent>
        </Card>
        <div className="flex items-center justify-between">
          <p className="hidden px-2 text-xs leading-normal text-center text-muted-foreground sm:block">
            AI Chatbot built with{' '}
            <ExternalLink href="https://openai.com/chatgpt">ChatGPT</ExternalLink>
          </p>
          <Button size="sm" variant="secondary">
            <UpdateIcon className="w-4 h-4 mr-2" />
            Regenerate Response
          </Button>
        </div>
      </div>
    </section>
  );
}

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
