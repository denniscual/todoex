'use client';
import { Separator } from '@/components/ui/separator';
import { OpenAIIcon } from '@/components/ui/icons';
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor';
import ChatPanel from './_chat-panel';
import { PropsWithChildren } from 'react';
import { useSearchParams } from 'next/navigation';

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
            <ul>
              {[initialMessage].map((val, idx) => (
                <li key={idx}>
                  <div className="relative flex items-start mb-4">
                    <span className="flex items-center justify-center w-8 h-8 bg-green-400 border rounded-md shadow select-none dark:bg-green-600 shrink-0">
                      <OpenAIIcon className="w-4 h-4 text-white" />
                    </span>
                    <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">{val}</div>
                  </div>
                  <Separator className="my-4 md:my-8" />
                </li>
              ))}
            </ul>
            <ChatScrollAnchor trackVisibility={false} />
          </>
        )}
      </div>
      {enableChat && <ChatPanel />}
    </>
  );
}
