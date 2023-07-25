'use server';
import { Task, updateTaskById } from '@/db';
import { ZodError } from 'zod';

export type UpdateTaskByIdAction = (task: { id: Task['id']; status: Task['status'] }) => Promise<{
  result: {
    message: string;
    status: Task['status'];
  };
}>;

export const updateTaskByIdAction: UpdateTaskByIdAction = async function updateTaskByIdAction({
  id,
  status,
}) {
  try {
    await updateTaskById({
      id,
      status,
    });
    return {
      result: {
        message: 'Task status is updated successfully.',
        status,
      },
    };
  } catch (err) {
    if (err instanceof ZodError) {
      console.log('Zod error: ', err.issues);
      throw new Error(JSON.stringify(err.issues));
    } else {
      console.log('Error when generating response: ', (err as Error).toString());
      throw new Error('Server error');
    }
  }
};
