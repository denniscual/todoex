import { SegmentDialogRoot } from '@/components/segment-dialog-root';
import { DialogContent } from '@/components/ui/dialog';
import { getUserProjects } from '@/db';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import AddTaskDialogForm from '@/app/(user-dashboard)/_components/add-task/add-task-dialog-form';
import { insertTaskAction } from '@/lib/actions';

// TODO:
// - add client-side validation with `insertTaskSchema Zod`.
export default async function AddTaskDialog() {
  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  const projects = await getUserProjects(user.id);

  return (
    <SegmentDialogRoot>
      <DialogContent className="sm:max-w-[425px]">
        <AddTaskDialogForm
          userId={user.id}
          insertTaskAction={async (newTask) => {
            'use server';
            const res = await insertTaskAction(newTask);
            // TODO:
            // - should revalidate the today page. but for now we remove
            //   it because even with revalidate, the today page is not updating.
            return res;
          }}
          projects={projects}
        />
      </DialogContent>
    </SegmentDialogRoot>
  );
}
