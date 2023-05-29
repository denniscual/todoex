import { Suspense } from 'react';

export default async function UserPage({ params }: { params: { id: string } }) {
  console.log('Render user page');
  await delay(2500);
  return (
    <div>
      <h1>User page {params.id}</h1>
      <Suspense fallback={<div>Loading child server...</div>}>
        <ChildServer />
      </Suspense>
    </div>
  );
}

function ChildServer() {
  return <div>Child server</div>;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
