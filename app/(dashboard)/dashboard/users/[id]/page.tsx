import { Suspense } from 'react';
import Button from '../_button';

export default async function UserPage({ params }: { params: { id: string } }) {
  await delay(2500);

  return (
    <div>
      <h1>User page {params.id}</h1>
      <Button />
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
