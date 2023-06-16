import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './db/schema.ts',
  connectionString: process.env['DB_URL'],
  out: './drizzle',
} satisfies Config;
