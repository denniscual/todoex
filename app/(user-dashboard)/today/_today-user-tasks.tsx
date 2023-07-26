'use client';
import { DATE_FORMATS, formatDate } from '@/lib/utils';
import UserTasks from '@/app/(user-dashboard)/_components/user-tasks';
import { TaskWithProject } from '@/db';
import { UpdateTaskByIdAction } from '@/lib/actions';
import { isSameDay } from 'date-fns';

export default function TodayUserTasks({
  tasks,
  // This function is a server action so we can ignore the warning.
  updateTaskByIdAction,
}: {
  tasks: TaskWithProject[];
  updateTaskByIdAction: UpdateTaskByIdAction;
}) {
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate, DATE_FORMATS.LONG_DATE_FORMAT);

  const todayUserTasks = tasks.filter((task) => {
    if (!task.dueDate) {
      return false;
    }
    return isSameDay(new Date(task.dueDate), currentDate);
  });

  return (
    <section className="space-y-10">
      <div className="inline-flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <span className="text-sm text-foreground/60">{formattedDate}</span>
      </div>
      <UserTasks tasks={todayUserTasks} updateTaskByIdAction={updateTaskByIdAction} />
    </section>
  );
}
