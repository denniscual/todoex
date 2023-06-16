import { Suspense } from 'react';
import DashboardContent from './_dashboard-content';

export default async function Dashboard() {
  return (
    <div className="space-y-7">
      <h1 className="font-semibold">Dashboard</h1>
      <div className="space-y-5">
        <DashboardContent>
          <Suspense fallback={<div>Loading...</div>}>
            {/* @ts-expect-error Async React Component */}
            <Users />
          </Suspense>
        </DashboardContent>
      </div>
    </div>
  );
}

async function Users() {
  const res = await fetch('http://localhost:3000/api/users', {
    cache: 'no-store',
  });
  const { users, app } = (await res.json()) as { users: { id: number; name: string }[]; app: any };

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      {app}
    </div>
  );
}
