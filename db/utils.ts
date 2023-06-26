import { cache } from 'react';
import { db, task, User, user } from '@/db';
import { eq } from 'drizzle-orm';

export const getUserTasks = cache(async (id: string) => {
  const tasks = await db.select().from(task).where(eq(task.userId, id));
  return tasks;
});

export async function insertTaskByUserId({
  id,
  title,
  description,
  projectId,
}: {
  id: string;
  title: string;
  description: string;
  projectId: number;
}) {
  await db.insert(task).values({
    userId: id,
    title,
    description,
    projectId,
  });
}

export async function deleteTaskById(id: number) {
  await db.delete(task).where(eq(task.id, id));
}

export async function upsertUser(value: User) {
  await db.insert(user).values(value).onDuplicateKeyUpdate({
    set: value,
  });
}
