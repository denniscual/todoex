'use client';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';

export default function Foo() {
  const { pending } = useFormStatus();

  return pending ? <div>Mutating...</div> : null;
}
