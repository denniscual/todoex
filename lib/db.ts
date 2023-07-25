import { Task } from '@/db';

export function toggleStatus(status: Task['status']) {
  return isTaskCompleted(status) ? 'pending' : 'completed';
}

export function isTaskCompleted(status: Task['status']) {
  return status === 'completed';
}

export const TASK_STATUS_TEXTS = {
  COMPLETED: 'completed',
  ADDED: 'added',
  OPENED: 'opened',
};
