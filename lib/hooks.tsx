'use client';
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  startTransition,
  useRef,
  type RefObject,
  ElementRef,
  useState,
} from 'react';

/**
 * A React hook that listens to the `popstate` event on the `window` object.
 * It invokes the provided callback function when the event is triggered.
 */
export function usePopstateListener(callback: () => void) {
  const effectEvent = useEffectEvent(callback);

  useEffect(() => {
    function callback() {
      startTransition(() => {
        effectEvent();
      });
    }
    window.addEventListener('popstate', callback);
    return () => {
      window.removeEventListener('popstate', callback);
    };
  }, [effectEvent]);
}

export function useEnterSubmit(): {
  formRef: RefObject<HTMLFormElement>;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
} {
  const formRef = useRef<ElementRef<'form'>>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      formRef.current?.requestSubmit();
      event.preventDefault();
    }
  };

  return { formRef, onKeyDown: handleKeyDown };
}

export function useAtBottom(offset = 0) {
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const atBottom = scrollTop + clientHeight + offset >= scrollHeight;

      setIsAtBottom(atBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [offset]);

  return isAtBottom;
}
