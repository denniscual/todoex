import ChatForm from './_chat-form';
import { getUserTasks } from '@/db';
import { currentUser } from '@clerk/nextjs';
export default async function Dashboard() {
  const user = await currentUser();
  const userId = user?.id ?? '';
  const tasks = await getUserTasks(userId);

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-4 font-semibold">Todo List</p>
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
        <ChatForm userId={userId} />
      </div>
    </div>
  );
}
