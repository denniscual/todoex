import { getTaskById } from '@/db';
import UserTaskDetails from '@/app/(user-dashboard)/_components/user-task-details';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import UserTaskActions from '@/app/(user-dashboard)/_components/user-task-actions';
import { deleteTaskByIdAction } from '@/lib/actions';
import { redirect } from 'next/navigation';

export default async function Task({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const userTask = await getTaskById(parseInt(params.id));

  if (!userTask) {
    return <div>No task found.</div>;
  }

  return (
    <Card>
      <CardHeader className="px-6 pt-2 pb-2 border-b">
        <CardDescription className="flex items-center justify-between">
          <Button variant="link" className="p-0 text-foreground/60" asChild>
            <Link href={`/projects/${userTask.projectId}`}>{userTask.projectTitle}</Link>
          </Button>
          <UserTaskActions task={userTask} deleteTaskByIdAction={deleteTaskByIdAction} />
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <UserTaskDetails id={parseInt(params.id)} />
      </CardContent>
    </Card>
  );
}
