'use client';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { useAtBottom } from '@/lib/hooks';

export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  const isAtBottom = useAtBottom();

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'absolute -top-14 -right-16 z-10 transition-opacity duration-300',
        isAtBottom ? 'opacity-0' : 'opacity-100',
        className
      )}
      onClick={() =>
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: 'smooth',
        })
      }
      {...props}
    >
      <ArrowDownIcon />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  );
}
