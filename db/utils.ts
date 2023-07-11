import { cache } from 'react';
import { db, task, User, user, project, projectUser, Project, Task } from '@/db';
import { eq, and } from 'drizzle-orm';

export const getUserProjectTasks = cache((userId: User['id'], projectId: Project['id']) => {
  const tasks = db
    .select()
    .from(task)
    .where(and(eq(task.userId, userId), eq(task.projectId, projectId)));
  return tasks;
});

export const getProject = cache(async (id: Project['id']) => {
  const projects = await db
    .select({
      title: project.title,
      description: project.description,
    })
    .from(project)
    .where(eq(project.id, id));
  return projects[0];
});

export const getUserProjects = cache((id: User['id']) => {
  const projects = db
    .select({
      title: project.title,
      id: project.id,
    })
    .from(project)
    .innerJoin(projectUser, eq(project.id, projectUser.projectId))
    .innerJoin(user, eq(user.id, projectUser.userId))
    .where(eq(user.id, id));
  return projects;
});

export async function insertTaskByUserId({
  id,
  title,
  description,
  projectId,
}: {
  id: User['id'];
  title: Task['title'];
  description: Task['description'];
  projectId: Project['id'];
}) {
  await db.insert(task).values({
    userId: id,
    title,
    description,
    projectId,
  });
}

export async function deleteTaskById(id: Task['id']) {
  await db.delete(task).where(eq(task.id, id));
}

export async function upsertUser(value: User) {
  await db.insert(user).values(value).onDuplicateKeyUpdate({
    set: value,
  });
}
