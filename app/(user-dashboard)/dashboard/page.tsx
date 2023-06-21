import ChatForm from './_chat-form';
import { getUserTasks } from '@/db';

export default async function Dashboard() {
  const tasks = await getUserTasks();

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-4 font-semibold">Todo List</p>
        <ul>
          {tasks.map((task, idx) => (
            <li key={task.id}>
              <span className="font-medium">{idx + 1}.</span> Title: {task.title} - Status:{' '}
              {task.status} - Due date: {task.dueDate}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-4 font-semibold">Chat Form</p>
        <ChatForm tasks={tasks} />
      </div>
    </div>
  );
}
