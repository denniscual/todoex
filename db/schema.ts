import {
  mysqlTable,
  int,
  index,
  varchar,
  text,
  date,
  mysqlEnum,
  timestamp,
} from 'drizzle-orm/mysql-core';
import { InferModel } from 'drizzle-orm';

export const task = mysqlTable(
  'task',
  {
    id: int('id').autoincrement().primaryKey().notNull(),
    userId: int('user_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    dueDate: date('due_date', { mode: 'string' }),
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

export const user = mysqlTable('user', {
  id: varchar('id', { length: 50 }).primaryKey().notNull(),
  username: varchar('username', { length: 50 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  emailAddress: varchar('email_address', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow(),
});

export type User = InferModel<typeof user>;
export type Task = InferModel<typeof task>;
