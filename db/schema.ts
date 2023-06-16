import {
  mysqlTable,
  AnyMySqlColumn,
  serial,
  varchar,
  mysqlEnum,
  uniqueIndex,
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

export const users = mysqlTable('users', {
  id: serial('id').primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
});
