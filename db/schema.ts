import {
  mysqlTable,
  int,
  index,
  varchar,
  text,
  date,
  mysqlEnum,
  timestamp,
  primaryKey,
} from 'drizzle-orm/mysql-core';
import { InferModel } from 'drizzle-orm';

export const user = mysqlTable('user', {
  id: varchar('id', { length: 50 }).primaryKey().notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  username: varchar('username', { length: 50 }),
  emailAddress: varchar('email_address', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const project = mysqlTable(
  'project',
  {
    id: int('id').autoincrement().primaryKey().notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow(),
  },
  (table) => {
    return {
      titleIdx: index('title_idx').on(table.title),
    };
  }
);

export const projectUser = mysqlTable(
  'project_user',
  {
    userId: varchar('user_id', { length: 50 }).notNull(),
    projectId: int('project_id').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey(table.userId, table.projectId),
    };
  }
);

export const task = mysqlTable(
  'task',
  {
    id: int('id').autoincrement().primaryKey().notNull(),
    userId: varchar('user_id', { length: 50 }).notNull(),
    projectId: int('project_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    dueDate: timestamp('due_date', { mode: 'string' }),
    status: mysqlEnum('status', ['pending', 'completed']).default('pending'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow(),
  },
  (table) => {
    return {
      titleIdx: index('title_idx').on(table.title),
    };
  }
);

export type User = InferModel<typeof user>;
export type Project = InferModel<typeof project>;
export type Task = InferModel<typeof task>;
