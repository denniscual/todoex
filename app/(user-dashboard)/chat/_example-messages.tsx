'use client';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ExampleMessages({
  messages = [],
}: {
  messages?: {
    heading: string;
    message: string;
  }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm leading-normal">
        You can now start a conversation or try the following examples:
      </p>
      {messages.map((message, idx) => (
        <Button
          key={idx}
          variant="link"
          className="h-auto p-0"
          onClick={() => {
            const newSearchParams = new URLSearchParams({
              ...Object.fromEntries(searchParams.entries()),
              initialMessage: idx.toString(),
            });
            router.replace(`/chat?${newSearchParams}`);
          }}
        >
          <ArrowRightIcon className="w-4 h-4 mr-2" />
          {message.heading}
        </Button>
      ))}
    </div>
  );
}
