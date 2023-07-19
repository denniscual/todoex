import { Task } from '@/db';

export function isTaskCompleted(task: Task) {
  return task.status === 'completed';
}

export const TASK_STATUS_TEXTS = {
  COMPLETED: 'completed',
  ADDED: 'added',
  OPENED: 'opened',
};
