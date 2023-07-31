import { cache } from 'react';
import { db, task, User, user, project, projectUser, Project, Task } from '@/db';
import { eq, and } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { DATE_FORMATS, areDatesEqualOrGreater, formatDate } from '@/lib/utils';
import { RequiredKeys } from '@/lib/types';

export async function upsertUser(upsertedUser: z.infer<typeof insertUserSchema>) {
  const validUpsertedUser = insertUserSchema.parse(upsertedUser);
  await db.insert(user).values(validUpsertedUser).onDuplicateKeyUpdate({
    set: validUpsertedUser,
  });
}

export const getUserProjectTasks = cache((userId: User['id'], projectId: Project['id']) => {
  const tasks = db
    .select({
      projectId: task.projectId,
      id: task.id,
      title: task.title,
      description: task.description,
      content: task.content,
      dueDate: task.dueDate,
      userId: task.userId,
      createdAt: task.createdAt,
      status: task.status,
      projectTitle: project.title,
      projectDescription: project.description,
    })
    .from(task)
    .innerJoin(project, eq(project.id, task.projectId))
    .where(and(eq(task.userId, userId), eq(task.projectId, projectId)));
  return tasks;
});

export const getUserTodayTasks = cache((userId: User['id']) => {
  const tasks = db
    .select({
      projectId: task.projectId,
      id: task.id,
      title: task.title,
      description: task.description,
      content: task.content,
      dueDate: task.dueDate,
      userId: task.userId,
      createdAt: task.createdAt,
      status: task.status,
      projectTitle: project.title,
      projectDescription: project.description,
    })
    .from(task)
    .innerJoin(project, eq(project.id, task.projectId))
    .where(
      and(
        eq(task.userId, userId),
        eq(task.dueDate, formatDate(new Date(), DATE_FORMATS.ISO_DATE_FORMAT))
      )
    );
  return tasks;
});

export const getUserTasks = cache((userId: User['id']) => {
  const tasks = db
    .select({
      projectId: task.projectId,
      id: task.id,
      title: task.title,
      description: task.description,
      content: task.content,
      dueDate: task.dueDate,
      userId: task.userId,
      createdAt: task.createdAt,
      status: task.status,
      projectTitle: project.title,
      projectDescription: project.description,
    })
    .from(task)
    .innerJoin(project, eq(project.id, task.projectId))
    .where(eq(task.userId, userId));
  return tasks;
});

export const getTaskById = cache(async (id: Task['id']) => {
  const tasks = await db
    .select({
      projectId: task.projectId,
      id: task.id,
      title: task.title,
      description: task.description,
      content: task.content,
      dueDate: task.dueDate,
      userId: task.userId,
      createdAt: task.createdAt,
      status: task.status,
      projectTitle: project.title,
      projectDescription: project.description,
    })
    .from(task)
    .innerJoin(project, eq(project.id, task.projectId))
    .where(eq(task.id, id));

  if (tasks.length === 0) {
    return null;
  }

  return tasks[0];
});

export const getProjectById = cache(async (id: Project['id']) => {
  const projects = await db
    .select({
      id: project.id,
      title: project.title,
      description: project.description,
    })
    .from(project)
    .where(eq(project.id, id));

  if (projects.length === 0) {
    return null;
  }

  return projects[0];
});

export const getUserProjects = cache((id: User['id']) => {
  const projects = db
    .select({
      title: project.title,
      id: project.id,
      description: project.description,
    })
    .from(project)
    .innerJoin(projectUser, eq(project.id, projectUser.projectId))
    .innerJoin(user, eq(user.id, projectUser.userId))
    .where(eq(user.id, id));
  return projects;
});

export async function insertTask(newTask: z.infer<typeof insertTaskSchema>) {
  const validNewtask = insertTaskSchema.parse(newTask);
  await db.insert(task).values(validNewtask);
}

export async function deleteTaskById(id: Task['id']) {
  const validId = z
    .number()
    .positive({
      message: 'The task id must be positive number.',
    })
    .parse(id);

  await db.delete(task).where(eq(task.id, validId));
}

export async function updateTaskById({
  id,
  status,
  dueDate,
  title,
  description,
  projectId,
  content,
}: RequiredKeys<Partial<z.infer<typeof insertTaskSchema>>, 'id'>) {
  const validValues = insertTaskSchema
    .pick({
      id: true,
      status: true,
      dueDate: true,
      title: true,
      description: true,
      projectId: true,
      content: true,
    })
    .parse({
      id,
      status,
      dueDate,
      title,
      description,
      projectId,
      content,
    });

  await db
    .update(task)
    .set(validValues)
    .where(eq(task.id, validValues.id as number));
}

export async function insertProject(
  newProject: Omit<z.infer<typeof insertProjectSchema> & { userId: User['id'] }, 'id'>
) {
  const projectId = generateId();
  const validProject = insertProjectSchema.parse({
    ...newProject,
    id: projectId,
  });
  return await db.transaction(async (tx) => {
    // Insert row into project
    await tx.insert(project).values(validProject);
    const projects = await tx.select().from(project).where(eq(project.id, projectId));
    const newlyInsertedProject = projects[0];
    // Insert row into ProjectUser
    const validProjectUser = insertProjectUserSchema.parse({
      projectId: newlyInsertedProject.id,
      userId: newProject.userId,
    });
    await tx.insert(projectUser).values(validProjectUser);
    return newlyInsertedProject;
  });
}

// Schema validation for inserting a user.
export const insertUserSchema = createInsertSchema(user, {
  emailAddress(schema) {
    return schema.emailAddress.email();
  },
});

// Schema validation for inserting a project.
export const insertProjectSchema = createInsertSchema(project);

// Schema validation for inserting a project.
export const insertProjectUserSchema = createInsertSchema(projectUser);

// Schema validation for inserting a task.
export const insertTaskSchema = createInsertSchema(task, {
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
          // TODO:
          // use date-fns to do the dates equality checking.
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

export type UserProject = Awaited<ReturnType<typeof getUserProjects>>[0];
export type TaskWithProject = Awaited<ReturnType<typeof getUserTodayTasks>>[0];

/**
 * Generate a time-based sortable id.
 */
function generateId() {
  // get current timestamp in milliseconds (total milliseconds since 1970/01/01)
  const timestamp = Date.now();
  // convert it to a base36 string (numbers + letters, case-insensitive)
  const timestampPart = timestamp.toString(36);
  // generate a random base36 string
  const randomPart = Math.random().toString(36).substring(2, 10);
  return timestampPart + randomPart;
}
