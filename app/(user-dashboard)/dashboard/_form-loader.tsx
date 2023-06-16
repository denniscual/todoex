'use client';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';

export default function FormLoader() {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return <span>Form submitting...</span>;
}
