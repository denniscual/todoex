'use client';
import { ErrorBoundary } from 'react-error-boundary';

export default function AppErrorBoundary(props: any) {
  return <ErrorBoundary {...props} />;
}
