import { cache } from 'react';
import { db, task, User, user } from '@/db';
import { eq, and } from 'drizzle-orm';

export const getUserTasksByProjectId = cache(async (id: string, projectId: number) => {
  const tasks = await db
    .select()
    .from(task)
    .where(and(eq(task.userId, id), eq(task.projectId, projectId)));
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
