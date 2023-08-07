'use client';
import { OpenAIIcon } from '@/components/ui/icons';
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor';
import ChatPanel from './_chat-panel';
import { HTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { PersonIcon } from '@radix-ui/react-icons';
import { ChatCompletionRequestMessage } from 'openai';
import { cn } from '@/lib/utils';

export default function Chat({
  initialMessage,
  children,
}: PropsWithChildren<{
  initialMessage?: string; // NOTE: If `enableChat` is true, then `initialMessage` has value.
}>) {
  const messages = [initialMessage];
  const params = useSearchParams();
  const projectId = params.get('pid');
  const enableChat = !!projectId;

  return (
    <>
      <div className="flex-1 px-2">
        <div className="mb-12">{messages.filter(Boolean).length === 0 && children}</div>
        {enableChat && (
          <>
            <ul className="space-y-4 md:space-y-8">
              <li key={0}>
                <ChatMessage
                  icon={
                    <ChatIcon className="bg-primary">
                      <PersonIcon className="w-4 h-4 text-primary-foreground" />
                    </ChatIcon>
                  }
                >
                  hello world
                </ChatMessage>
              </li>
              <li>
                <Card>
                  <CardContent className="px-0 pt-6">
                    <ChatMessage
                      icon={
                        <ChatIcon className="bg-green-400 dark:bg-green-600">
                          <OpenAIIcon className="w-4 h-4 text-white" />
                        </ChatIcon>
                      }
                    >
                      Hello world
                    </ChatMessage>
                  </CardContent>
                </Card>
              </li>
            </ul>
            <ChatScrollAnchor trackVisibility={false} />
          </>
        )}
      </div>
      {enableChat && <ChatPanel />}
    </>
  );
}

function ChatMessage({ icon, children }: PropsWithChildren<{ icon?: ReactNode }>) {
  return (
    <div className="flex items-start px-6">
      {icon}
      <div className="flex-1 px-1 ml-4">{children}</div>
    </div>
  );
}

function ChatIcon({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      {...props}
      className={cn(
        'flex items-center justify-center w-8 h-8 border rounded-md shadow select-none shrink-0',
        className
      )}
    >
      {children}
    </span>
  );
}
