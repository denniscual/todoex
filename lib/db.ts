import { Task } from '@/db';

export function isTaskCompleted(status: Task['status']) {
  return status === 'completed';
}

export const TASK_STATUS_TEXTS = {
  COMPLETED: 'completed',
  ADDED: 'added',
  OPENED: 'opened',
};
