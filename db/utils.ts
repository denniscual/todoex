import 'server-only';
import { cache } from 'react';
import { db, task, User, user } from '@/db';
import { eq } from 'drizzle-orm';

export const getUserTasks = cache(async (id: number = 1) => {
  const tasks = await db.select().from(task).where(eq(task.userId, 1));
  return tasks;
});

export async function insertTaskById({
  id,
  title,
  description,
}: {
  id: number;
  title: string;
  description: string;
}) {
  await db.insert(task).values({
    userId: id,
    title,
    description,
  });
}

export async function upsertUser(value: User) {
  await db.insert(user).values(value).onDuplicateKeyUpdate({
    set: value,
  });
}
