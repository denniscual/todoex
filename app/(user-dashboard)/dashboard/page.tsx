import { db, user } from '@/db';

export const runtime = 'edge';

export default async function Dashboard() {
  const allUsers = await db.select().from(user);

  return (
    <div className="space-y-7">
      <section className="space-y-4">
        <h2 className="font-medium">Users</h2>
        <ul>
          {allUsers.map((user) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
