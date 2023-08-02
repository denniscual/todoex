'use client';
import { useInView } from 'react-intersection-observer';
import { useAtBottom } from '@/lib/hooks';
import { useEffect } from 'react';

interface ChatScrollAnchorProps {
  trackVisibility?: boolean;
}

/**
 * A Component helps maintain a user-friendly chat experience by keeping the latest
 * messages in view while not interrupting the user when they're reading earlier parts
 * of the conversation.
 */
export function ChatScrollAnchor({ trackVisibility = false }: ChatScrollAnchorProps) {
  const isAtBottom = useAtBottom();
  const { ref, entry, inView } = useInView({
    trackVisibility,
    delay: 100,
    rootMargin: '0px 0px -150px 0px',
  });

  useEffect(() => {
    if (isAtBottom && trackVisibility && !inView) {
      entry?.target.scrollIntoView({
        block: 'start',
      });
    }
  }, [inView, entry, isAtBottom, trackVisibility]);

  return <div ref={ref} className="w-full h-px" />;
}
