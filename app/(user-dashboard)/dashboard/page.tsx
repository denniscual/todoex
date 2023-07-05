import ChatForm from './_chat-form';
import { getUserTasksByProjectId, db, project } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';

export default async function Dashboard() {
  const user = await currentUser();
  const userId = user?.id ?? '';
  const projectId = 1;
  const tasks = await getUserTasksByProjectId(userId, projectId);
  const projects = await db
    .select({
      title: project.title,
      description: project.description,
    })
    .from(project)
    .where(eq(project.id, projectId));
  const currentProject = projects[0];

  if (!currentProject) {
    return <div>Current project is not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
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
      </div>
      <div>
        <p className="mb-4 font-semibold">Chat Form</p>
        <ChatForm projectId={projectId} userId={userId} />
      </div>
    </div>
  );
}
