'use client';
import { useEffect, experimental_useEffectEvent as useEffectEvent, startTransition } from 'react';

/**
 * A React hook that listens to the `popstate` event on the `window` object.
 * It invokes the provided callback function when the event is triggered.
 */
export function usePopstateListener(callback: () => void) {
  const effectEvent = useEffectEvent(callback);

  useEffect(() => {
    function callback() {
      console.log('callback');
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
