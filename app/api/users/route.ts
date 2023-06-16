import { NextResponse, NextRequest } from 'next/server';

const users = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  name: `User ${i}`,
}));

export async function GET() {
  await delay(10000);

  return NextResponse.json({ users, message: 'Users found' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;
  const id = users.length;

  users.push({ id, name });

  return NextResponse.json({ users, message: 'User created' });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
