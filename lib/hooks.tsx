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
 * A React hook to add a listener to the 'popstate' event.
 * This event is fired when the active history entry changes,
 * usually due to the user navigating the session history.
 *
 * @example
 * import { usePopstateListener } from './path/to/your/hook';
 *
 * function MyComponent() {
 *   usePopstateListener(() => {
 *     console.log('The popstate event was triggered.');
 *   });
 *
 *   return (
 *     <div>
 *       Navigate around, and check the console when using the browser's back or forward buttons.
 *     </div>
 *   );
 * }
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

/**
 * A React hook to enable form submission when the Enter key is pressed within a textarea element.
 * Shift + Enter and composing Enter key events will be ignored.
 *
 * @example
 * import { useEnterSubmit } from './path/to/your/hook';
 *
 * function MyComponent() {
 *   const { formRef, onKeyDown } = useEnterSubmit();
 *
 *   return (
 *     <form ref={formRef}>
 *       <textarea onKeyDown={onKeyDown}></textarea>
 *       <button type="submit">Submit</button>
 *     </form>
 *   );
 * }
 */
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

/**
 * A React hook to determine whether the window scroll is at the bottom.
 *
 * @example
 * import { useAtBottom } from './path/to/your/hook';
 *
 * function MyComponent() {
 *   const isAtBottom = useAtBottom(100); // will consider "at bottom" 100px before the actual bottom
 *
 *   return (
 *     <div>
 *       {isAtBottom ? 'You are at the bottom!' : 'Keep scrolling...'}
 *     </div>
 *   );
 * }
 */
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

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
