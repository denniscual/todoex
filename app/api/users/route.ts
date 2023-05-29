import { NextResponse } from 'next/server';

const users = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  name: `User ${i}`,
}));

setInterval(() => {
  users.push({
    id: users.length,
    name: `User ${users.length}`,
  });
}, 1000);

export async function GET() {
  return NextResponse.json({ users, message: 'Users found' });
}
