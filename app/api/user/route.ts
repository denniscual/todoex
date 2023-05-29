export async function POST() {
  await delay(2000);

  return new Response('Hello, Next.js!', {
    status: 200,
    headers: { 'x-user': 'irish' },
  });
}

// This function waits for a certain number of milliseconds before returning.

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
