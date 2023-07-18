import { cache } from 'react';
import { db, task, User, user, project, projectUser, Project, Task } from '@/db';
import { eq, and } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { DATE_FORMATS, areDatesEqualOrGreater, formatDate } from '@/lib/utils';

export async function upsertUser(upsertedUser: z.infer<typeof insertUserSchema>) {
  const validUpsertedUser = insertUserSchema.parse(upsertedUser);
  await db.insert(user).values(validUpsertedUser).onDuplicateKeyUpdate({
    set: validUpsertedUser,
  });
}

export const getUserProjectTasks = cache((userId: User['id'], projectId: Project['id']) => {
  const tasks = db
    .select()
    .from(task)
    .where(and(eq(task.userId, userId), eq(task.projectId, projectId)));
  return tasks;
});

export const getUserTodayTasks = cache((userId: User['id']) => {
  const tasks = db
    .select()
    .from(task)
    .where(
      and(
        eq(task.userId, userId),
        eq(task.dueDate, formatDate(new Date(), DATE_FORMATS.ISO_DATE_FORMAT))
      )
    );
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

export async function updateTaskStatusById(id: Task['id'], status: Task['status']) {
  const validValues = insertTaskSchema
    .pick({
      id: true,
      status: true,
      dueDate: true,
    })
    .parse({
      id,
      status,
    });

  await db
    .update(task)
    .set({
      status: validValues.status,
    })
    .where(eq(task.id, validValues.id as number));
}

export function isTaskCompleted(task: Task) {
  return task.status === 'completed';
}

// Schema validation for inserting a user.
export const insertUserSchema = createInsertSchema(user, {
  emailAddress(schema) {
    return schema.emailAddress.email();
  },
});

// Schema validation for inserting a project.
export const insertProjectSchema = createInsertSchema(project);

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
          console.log({
            dueDate,
            currentDate,
            val,
          });
          return areDatesEqualOrGreater(dueDate, currentDate);
        },
        {
          message: 'The due date must be on or after the current date.',
        }
      );
  },
});
