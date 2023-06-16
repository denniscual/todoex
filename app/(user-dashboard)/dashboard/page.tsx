import { db, users } from '@/db';

export const runtime = 'edge';

export default async function Dashboard() {
  const allUsers = await db.select().from(users);
  console.log({ allUsers });

  return (
    <div className="space-y-7">
      <h1 className="font-semibold">Dashboard</h1>
    </div>
  );
}
