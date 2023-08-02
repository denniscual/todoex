import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import Link from 'next/link';
import { SegmentDialogRoot } from '@/components/segment-dialog-root';
import { Task, getTaskById } from '@/db';
import UserTaskDetails from '@/app/(user-dashboard)/_components/user-task-details';
import UserTaskActions from '@/app/(user-dashboard)/_components/user-task-actions';
import { deleteTaskByIdAction } from '@/lib/actions';

export default async function EditTaskDialog({ id }: { id: Task['id'] }) {
  const userTask = await getTaskById(id);

  if (!userTask) {
    return <div>No task found.</div>;
  }

  return (
    <SegmentDialogRoot>
      <DialogContent className="max-w-[864px] h-[calc(100%-96px)] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-2 pb-2 border-b">
          <DialogDescription className="flex items-center justify-between">
            <Button variant="link" className="p-0 text-foreground/60" asChild>
              <Link href={`/projects/${userTask.projectId}`}>{userTask.projectTitle}</Link>
            </Button>
            <span className="mr-6">
              <UserTaskActions
                redirectBackAfterDeletion
                task={userTask}
                deleteTaskByIdAction={deleteTaskByIdAction}
              />
            </span>
          </DialogDescription>
        </DialogHeader>
        <UserTaskDetails id={id} />
      </DialogContent>
    </SegmentDialogRoot>
  );
}
