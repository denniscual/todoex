import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import TaskDialog from './_task-dialog';
import { getTaskById } from '@/db';
import UserTaskDetails from '@/app/(user-dashboard)/_components/user-task-details';

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
    <TaskDialog>
      <DialogContent className="max-w-[864px] h-[calc(100%-96px)] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-2 pb-2 border-b">
          <DialogTitle>
            <Button variant="link" className="p-0 text-foreground/60" asChild>
              <Link href={`/projects/${userTask.projectId}`}>{userTask.projectTitle}</Link>
            </Button>
          </DialogTitle>
        </DialogHeader>
        <UserTaskDetails id={parseInt(params.id)} />
      </DialogContent>
    </TaskDialog>
  );
}
