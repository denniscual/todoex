import { InferColumnsDataTypes } from 'drizzle-orm';
import {
  mysqlTable,
  serial,
  varchar,
  mysqlEnum,
  uniqueIndex,
  index,
  int,
  bigint,
  tinyint,
} from 'drizzle-orm/mysql-core';

export const cities = mysqlTable('cities', {
  id: serial('id').primaryKey().notNull(),
  name: varchar('name', { length: 256 }),
  popularity: mysqlEnum('popularity', ['unknown', 'known', 'popular']),
});

export const countries = mysqlTable(
  'countries',
  {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name', { length: 256 }),
  },
  (table) => {
    return {
      nameIdx: uniqueIndex('name_idx').on(table.name),
    };
  }
);

export const orders = mysqlTable(
  'orders',
  {
    id: serial('id').primaryKey().notNull(),
    orderNumber: int('orderNumber').notNull(),
    userId: bigint('userId', { mode: 'number' }).notNull(),
  },
  (table) => {
    return {
      userIdIdx: index('userId_idx').on(table.userId),
    };
  }
);

export const users = mysqlTable(
  'users',
  {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    age: tinyint('age').notNull(),
  },
  (table) => {
    return {
      ageIdx: index('age_idx').on(table.age),
      nameIdx: index('name_idx').on(table.name),
    };
  }
);

export type User = InferColumnsDataTypes<(typeof users)['$columns']>;
