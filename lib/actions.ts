'use server';
import { TaskWithProject, updateTaskById, insertTask, insertTaskSchema } from '@/db';
import { ZodError, z } from 'zod';

export type InsertTaskAction = (task: z.infer<typeof insertTaskSchema>) => Promise<{
  result: {
    message: string;
  };
}>;

export const insertTaskAction: InsertTaskAction = async function (task) {
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
};

export type UpdateTaskByIdAction = (task: TaskWithProject) => Promise<{
  result: {
    message: string;
  } & TaskWithProject;
}>;

export const updateTaskByIdAction: UpdateTaskByIdAction = async function (task) {
  try {
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
