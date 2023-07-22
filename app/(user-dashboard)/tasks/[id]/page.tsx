import { getTaskById } from '@/db';
import UserTaskDetails from '@/app/(user-dashboard)/_components/user-task-details';
import { Card, CardContent } from '@/components/ui/card';

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
      <CardContent className="p-0">
        <UserTaskDetails id={parseInt(params.id)} />
      </CardContent>
    </Card>
  );
}
