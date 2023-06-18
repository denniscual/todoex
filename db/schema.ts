import { mysqlTable, int, varchar, text, date, mysqlEnum, timestamp } from 'drizzle-orm/mysql-core';
import { InferColumnsDataTypes } from 'drizzle-orm';

export const task = mysqlTable('task', {
  id: int('id').autoincrement().primaryKey().notNull(),
  userId: int('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  // you can use { mode: 'date' }, if you want to have Date as type for this column
  dueDate: date('due_date', { mode: 'string' }),
  status: mysqlEnum('status', ['pending', 'completed']).default('pending'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const user = mysqlTable('user', {
  id: int('id').autoincrement().primaryKey().notNull(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow(),
});

export type User = InferColumnsDataTypes<(typeof user)['$columns']>;
export type Task = InferColumnsDataTypes<(typeof task)['$columns']>;
