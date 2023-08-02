'use client';
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  startTransition,
  useRef,
  type RefObject,
  ElementRef,
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
