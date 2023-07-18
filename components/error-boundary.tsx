'use client';
import { PropsWithChildren, useEffect } from 'react';
import { ErrorBoundary as RootErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';

export function ErrorBoundary({ children }: PropsWithChildren) {
  return (
    <RootErrorBoundary
      fallbackRender={(errorProps) => {
        return <FallbackComponent {...errorProps}>{children}</FallbackComponent>;
      }}
    >
      {children}
    </RootErrorBoundary>
  );
}

function FallbackComponent({
  error,
  resetErrorBoundary,
  children,
}: PropsWithChildren<FallbackProps>) {
  const { toast } = useToast();
  console.log({ error });

  useEffect(() => {
    toast({
      variant: 'destructive',
      title: 'Uh oh! Something went wrong.',
      description: 'There was a problem with your request.',
      action: (
        <ToastAction onClick={resetErrorBoundary} altText="Try again">
          Try again
        </ToastAction>
      ),
    });
  }, [resetErrorBoundary, toast]);

  return children;
}
