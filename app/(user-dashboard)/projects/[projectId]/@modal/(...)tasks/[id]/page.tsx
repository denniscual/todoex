import EditTaskDialog from '@/app/(user-dashboard)/_components/edit-task/edit-task-dialog';

export default async function EditTask({
  params,
}: {
  params: {
    id: string;
  };
}) {
  return <EditTaskDialog id={parseInt(params.id)} />;
}
