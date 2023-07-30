'use server';
import {
  TaskWithProject,
  updateTaskById,
  insertTask,
  insertTaskSchema,
  Task,
  deleteTaskById,
} from '@/db';
import { ZodError, z } from 'zod';

export type InsertTaskAction = (task: z.infer<typeof insertTaskSchema>) => Promise<{
  result: {
    message: string;
  };
}>;

export const insertTaskAction: InsertTaskAction = actionWrapper(async function (task) {
  try {
    await insertTask(task);
    return {
      result: {
        message: 'Task status is added successfully.',
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
});

export type UpdateTaskByIdAction = (task: TaskWithProject) => Promise<{
  result: {
    message: string;
  } & TaskWithProject;
}>;

export const updateTaskByIdAction: UpdateTaskByIdAction = actionWrapper(async function (task) {
  await updateTaskById({
    id: task.id,
    status: task.status,
    dueDate: task.dueDate,
    title: task.title,
    description: task.description,
    projectId: task.projectId,
    // TODO:
    // - change to its correct type
    content: task.content as any,
  });
  return {
    result: {
      message: 'Task status is updated successfully.',
      ...task,
    },
  };
});

export const deleteTaskByIdAction = actionWrapper(async function (id: Task['id']) {
  await deleteTaskById(id);
  return {
    result: {
      message: 'Task status is delete successfully.',
    },
  };
});

/**
 * A Wrapper function that extends the passed `action`. E.g it handles the error
 * message throws by the `action.
 */
function actionWrapper<T extends (...args: any[]) => Promise<any>>(action: T): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await action(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        console.log('Zod error: ', err.issues);
        throw new Error(JSON.stringify(err.issues));
      } else {
        console.log('Error when generating response: ', (err as Error).toString());
        throw new Error('Server error');
      }
    }
  }) as T;
}
