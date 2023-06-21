'use client';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';

export default function FormLoader() {
  const { pending } = useFormStatus();
  return (
    <div>
      <button
        disabled={pending}
        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
      >
        Add this task?
      </button>
      {pending && <div>Adding it...</div>}
    </div>
  );
}
