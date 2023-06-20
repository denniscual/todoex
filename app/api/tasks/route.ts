import { db, task } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  // TODO:
  // - we are going to get the user id from the Auth (ClerkJS).
  const data = await db.select().from(task).where(eq(task.userId, 1));
  return NextResponse.json({ data });
}
