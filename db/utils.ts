import { cache } from 'react';
import { db, task, User, user, project, projectUser, Project, Task } from '@/db';
import { eq, and } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

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

// Schema validation for inserting a task.
export const insertTaskSchema = createInsertSchema(task, {
  projectId(schema) {
    return schema.projectId.positive({
      message: 'The project id must be positive number.',
    });
  },
  dueDate(schema) {
    return schema.dueDate
      .regex(
        // Valid date format is "YYYY-MM-DD".
        /^\d{4}-\d{2}-\d{2}$/,
        {
          message: 'Invalid date format.',
        }
      )
      .refine(
        (val) => {
          const dueDate = new Date(val);
          const currentDate = new Date();
          return areDatesEqualOrGreater(dueDate, currentDate);
        },
        {
          message: 'The due date must be on or after the current date.',
        }
      );
  },
});

function areDatesEqualOrGreater(date1: Date, date2: Date) {
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  return date1 >= date2;
}
